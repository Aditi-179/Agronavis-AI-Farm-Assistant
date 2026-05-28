import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Dashboard.module.css';
import WeatherBlock from './WeatherBlock';
import FarmLocationWidget from './FarmLocationWidget';
import PolygonMapper from './map/PolygonMapper';
import { farmApi } from '../utils/farmApi';
import { soilService } from '../utils/soilService';
import { useReverseGeocode } from '../hooks/useReverseGeocode';
import type { LatLng } from '../utils/geoUtils';
import FertilizerRecommendation from './FertilizerRecommendation';

interface Farm {
  id: string;
  name: string;
  total_area: number;
  location?: {
    latitude?: number;
    longitude?: number;
    state?: string;
    district?: string;
    village?: string;
    polygon?: Array<{lat: number; lng: number}>;
    center_latitude?: number;
    center_longitude?: number;
  };
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('crop');
  const [mapMode, setMapMode] = useState<'view' | 'draw' | 'edit'>('view');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [polygonData, setPolygonData] = useState<{
    coordinates: LatLng[];
    areaAcres: number;
    areaHectares: number;
    centerLat: number;
    centerLng: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);
  const [showCropPrompt, setShowCropPrompt] = useState(false);

  const { geocode } = useReverseGeocode();

  const selectedFarm = farms.find(f => f.id === selectedFarmId);

  const loadFarms = useCallback(async () => {
    try {
      const farmsData = await farmApi.getFarms();
      setFarms(farmsData);
      if (farmsData.length > 0 && !selectedFarmId) {
        setSelectedFarmId(farmsData[0].id);
      }
    } catch (error) {
      console.error('Error loading farms:', error);
    }
  }, [selectedFarmId]);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  useEffect(() => {
    const mode = router.query.mode as string;
    const farmId = router.query.farmId as string;

    // Wait for farms list to load before setting selectedFarmId from query param
    // This prevents a race condition where the farm isn't in state yet
    if (mode === 'draw' && farmId && farms.length > 0) {
      setSelectedFarmId(farmId);
      setMapMode('draw');
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [router.query, farms]);

  const navigateToWeatherForecast = () => {
    router.push('/weather-forecast');
  };
  
  const openCamera = () => {
    router.push('/camera');
  };

  const getMapCenter = (): LatLng => {
    if (selectedFarm?.location?.latitude && selectedFarm?.location?.longitude) {
      return { lat: selectedFarm.location.latitude, lng: selectedFarm.location.longitude };
    }
    if (polygonData) {
      return { lat: polygonData.centerLat, lng: polygonData.centerLng };
    }
    return { lat: 22.5726, lng: 88.3639 };
  };

  const handlePolygonComplete = (data: typeof polygonData) => {
    setPolygonData(data);
  };

  const handleEditFarm = (farmId: string) => {
    setSelectedFarmId(farmId);
    setMapMode('edit');
  };

  const handleSavePolygon = async () => {
    if (!polygonData || !selectedFarmId) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      // Use farmApi (has auth interceptor) instead of raw axios
      await farmApi.updateFarm(selectedFarmId, {
        total_area: polygonData.areaAcres,
        latitude: polygonData.centerLat,
        longitude: polygonData.centerLng,
        location: {
          ...selectedFarm?.location,
          polygon: polygonData.coordinates.map(p => ({ lat: p.lat, lng: p.lng })),
          center_latitude: polygonData.centerLat,
          center_longitude: polygonData.centerLng,
          area_acres: polygonData.areaAcres,
          area_hectares: polygonData.areaHectares,
        },
      });

      setSaveMessage({ type: 'success', text: `Boundary saved! ${polygonData.areaAcres} acres` });
      
      // Auto-trigger Soil Estimation
      setSaveMessage({ type: 'info', text: `Analyzing regional soil data...` });
      try {
        const geoResult = await geocode(polygonData.centerLat, polygonData.centerLng);
        if (geoResult && geoResult.state && geoResult.district) {
          await soilService.estimateSoilHealth(selectedFarmId, geoResult.state, geoResult.district);
          setSaveMessage({ type: 'success', text: `Soil data analyzed for ${geoResult.district}` });
        }
      } catch (err) {
        console.error('Failed to estimate soil health automatically', err);
      }

      await loadFarms(); // Reload to get updated farm location & trigger fertilizer card update

      setTimeout(() => {
        setMapMode('view');
        setPolygonData(null);
        setSaveMessage(null);
        
        // After successfully saving a boundary, prompt the user to add a crop so we can calculate fertilizer
        setShowCropPrompt(true);
      }, 2000);
    } catch (error: any) {
      console.error('Error saving boundary:', error);
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save boundary' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewFarm = () => {
    router.push('/onboarding/farm');
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('dashboard.welcome')}</h1>
      </div>

      {activeTab === 'crop' && (
        <>
          <div className={styles.weatherCard} onClick={navigateToWeatherForecast}>
            <WeatherBlock compact={true} />
          </div>

          <div className={styles.cardsGrid}>
            <div className={styles.card} onClick={openCamera}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>{t('dashboard.cropDiagnosis.title')}</div>
              </div>
              <div className={styles.diagnosisContent}>
                <h3>{t('dashboard.cropDiagnosis.testYourCrop')}</h3>
                
                <div className={styles.diagnosisSteps}>
                  <div className={styles.diagnosisStep}>
                    <div className={`${styles.stepIcon} ${styles.stepIconGlow}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"></path>
                      </svg>
                    </div>
                    <div className={styles.stepText}>{t('dashboard.cropDiagnosis.steps.takePicture')}</div>
                  </div>
                  
                  <div className={styles.stepArrow}>→</div>
                  
                  <div className={styles.diagnosisStep}>
                    <div className={`${styles.stepIcon} ${styles.stepIconRipple}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="48" height="48">
                        <rect x="20" y="15" width="60" height="75" rx="4" fill="#f8f9fa" stroke="#2c3e50" strokeWidth="2"/>
                        <rect x="40" y="10" width="20" height="8" rx="3" fill="#34495e"/>
                        <line x1="25" y1="28" x2="75" y2="28" stroke="#3498db" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="30" y1="40" x2="70" y2="40" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="30" y1="50" x2="65" y2="50" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="30" y1="60" x2="70" y2="60" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="30" y1="70" x2="60" y2="70" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="65" cy="75" r="8" fill="#27ae60" stroke="#1e8449" strokeWidth="1.5"/>
                        <polyline points="61,75 64,78 69,73" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.stepText}>{t('dashboard.cropDiagnosis.steps.seeDiagnosis')}</div>
                  </div>
                  
                  <div className={styles.stepArrow}>→</div>
                  
                  <div className={styles.diagnosisStep}>
                    <div className={`${styles.stepIcon} ${styles.stepIconGlow}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,200H40V72H216V200Zm-56-64a8,8,0,0,1-8,8H136v16a8,8,0,0,1-16,0V144H104a8,8,0,0,1,0-16h16V112a8,8,0,0,1,16,0v16h16A8,8,0,0,1,160,136Z"></path>
                      </svg>
                    </div>
                    <div className={styles.stepText}>{t('dashboard.cropDiagnosis.steps.getMedicine')}</div>
                  </div>
                </div>
                
                <button className={styles.diagnosisButton} onClick={openCamera}>
                  {t('dashboard.cropDiagnosis.steps.takePicture')}
                </button>
              </div>
            </div>
            
            {/* Show Fertilizer Recommendation if a farm has been explicitly selected or loaded */}
            {selectedFarmId && (
              <FertilizerRecommendation farmId={selectedFarmId} />
            )}

            <div className={styles.featuresCard}>
              <h3>{t('dashboard.features.title')}</h3>
              <div className={styles.featuresGrid}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🇮🇳</div>
                  <div className={styles.featureText}>{t('dashboard.features.governmentScheme')}</div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>📝</div>
                  <div className={styles.featureText}>{t('dashboard.features.reportsAndTreatment')}</div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🧮</div>
                  <div className={styles.featureText}>{t('dashboard.features.fertilizerCalculator')}</div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>📚</div>
                  <div className={styles.featureText}>{t('dashboard.features.diseaseLibrary')}</div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🚜</div>
                  <div className={styles.featureText}>{t('dashboard.features.automaticWater')}</div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🌱</div>
                  <div className={styles.featureText}>{t('dashboard.features.seeds')}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'map' && mapMode === 'view' && (
        <div className={styles.mapTabContainer}>
          <div className={styles.mapTabHeader}>
            <button className={`${styles.mapTabButton} ${styles.mapTabButtonActive}`}>
              📍 View Farms
            </button>
            <button
              onClick={() => router.push('/onboarding/farm')}
              className={styles.mapTabButton}
            >
              ➕ Add Farm
            </button>
          </div>
          
          <div className={styles.mapContent}>
            <FarmLocationWidget />
            
            {farms.length > 0 && (
              <div className={styles.fieldsSection}>
                <div className={styles.fieldsSectionHeader}>
                  <h3 className={styles.fieldsSectionTitle}>Your Farms</h3>
                </div>
                <div className={styles.fieldCardsGrid}>
                  {farms.map((farm) => (
                    <div 
                      key={farm.id} 
                      className={styles.fieldCard}
                      onClick={() => setSelectedFarmId(farm.id)}
                    >
                      <div className={styles.fieldCardHeader}>
                        <span className={styles.fieldCardIcon}>🌾</span>
                        <span className={styles.fieldCardName}>{farm.name}</span>
                      </div>
                      <div className={styles.fieldCardDetails}>
                        <div className={styles.fieldCardRow}>
                          <span>Area:</span>
                          <strong>{farm.total_area} acres</strong>
                        </div>
                        <div className={styles.fieldCardRow}>
                          <span>Location:</span>
                          <span>{farm.location?.village || farm.location?.district || 'Not set'}</span>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={(e) => { e.stopPropagation(); handleEditFarm(farm.id); }}
                        >
                          ✏️ Edit Boundary
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'map' && (mapMode === 'draw' || mapMode === 'edit') && (
        // Full-screen overlay — covers the whole viewport so the map + action bar have no clipping
        <div style={{
          position: 'fixed', inset: 0, background: 'white',
          display: 'flex', flexDirection: 'column', zIndex: 2000,
          overflowY: 'auto',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderBottom: '1px solid #e5e7eb',
            background: 'white', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10,
          }}>
            <button
              onClick={() => { setMapMode('view'); setPolygonData(null); }}
              style={{
                padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8,
                background: 'white', fontSize: 14, cursor: 'pointer', fontWeight: 600
              }}
            >
              ← Back
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937' }}>
                {mapMode === 'draw' ? 'Draw Farm Boundary' : 'Edit Farm Boundary'}
              </div>
              {selectedFarm && (
                <div style={{ fontSize: 12, color: '#6b7280' }}>{selectedFarm.name}</div>
              )}
            </div>
            {/* Live area badge once polygon confirmed */}
            {polygonData && (
              <div style={{
                background: '#dcfce7', color: '#166534', borderRadius: 8,
                padding: '6px 12px', fontSize: 13, fontWeight: 600,
              }}>
                ✓ {polygonData.areaAcres} ac
              </div>
            )}
          </div>

          {/* PolygonMapper takes all remaining space naturally */}
          <div style={{ flex: 1, padding: '12px 12px 0 12px' }}>
            <PolygonMapper
              onPolygonComplete={handlePolygonComplete}
              initialCenter={getMapCenter()}
            />
          </div>

          {/* Save message banner */}
          {saveMessage && (
            <div style={{
              margin: '8px 12px 0',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              background: saveMessage.type === 'success' ? '#dcfce7' : '#fef2f2',
              color: saveMessage.type === 'success' ? '#16a34a' : '#dc2626',
              flexShrink: 0,
            }}>
              {saveMessage.type === 'success' ? '✅' : '❌'} {saveMessage.text}
            </div>
          )}

          {/* Sticky Save bar — appears once polygon is confirmed via PolygonMapper */}
          {polygonData && (
            <div style={{
              flexShrink: 0,
              padding: '12px 16px',
              background: 'white',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              marginTop: 8,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Ready to save</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#15803d' }}>
                  {polygonData.areaAcres} acres &nbsp;·&nbsp;
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#0f766e' }}>
                    {polygonData.areaHectares} hectares
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                  {polygonData.coordinates.length} boundary points
                </div>
              </div>
              <button
                onClick={() => { setMapMode('view'); setPolygonData(null); }}
                style={{
                  padding: '10px 16px', border: '1px solid #d1d5db',
                  borderRadius: 8, background: 'white', fontSize: 14, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePolygon}
                disabled={saving}
                style={{
                  padding: '10px 20px',
                  background: saving ? '#d1d5db' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  minWidth: 130,
                }}
              >
                {saving ? 'Saving...' : '💾 Save Boundary'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'map' && farms.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🌾</div>
          <div className={styles.emptyStateTitle}>No Farms Found</div>
          <div className={styles.emptyStateText}>
            Add your first farm to get started.
          </div>
          <button 
            className={styles.addFarmButton}
            onClick={() => router.push('/onboarding/farm')}
          >
            + Add Your First Farm
          </button>
        </div>
      )}

      {activeTab === 'community' && (
        <div className={styles.comingSoon}>
          <div className={styles.comingSoonIcon}>👥</div>
          <h3>Community Forum</h3>
          <p>Connect with other farmers. Coming soon.</p>
        </div>
      )}

      {activeTab === 'you' && (
        <div className={styles.comingSoon}>
          <div className={styles.comingSoonIcon}>👤</div>
          <h3>Farmer Profile</h3>
          <p>Manage your account settings. Coming soon.</p>
        </div>
      )}

      {/* Global Navigation */}
      <nav className={styles.bottomNav}>
        <button 
          className={`${styles.navItem} ${activeTab === 'crop' ? styles.active : ''}`}
          onClick={() => setActiveTab('crop')}
        >
          <span className={styles.navIcon}>🌱</span>
          <span className={styles.navLabel}>{t('dashboard.navigation.crop')}</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'map' ? styles.active : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <span className={styles.navIcon}>🗺️</span>
          <span className={styles.navLabel}>{t('dashboard.navigation.map')}</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'community' ? styles.active : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <span className={styles.navIcon}>👥</span>
          <span className={styles.navLabel}>{t('dashboard.navigation.community')}</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'you' ? styles.active : ''}`}
          onClick={() => setActiveTab('you')}
        >
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navLabel}>{t('dashboard.navigation.you')}</span>
        </button>
      </nav>

      {/* Post-Save Crop Prompt Modal */}
      {showCropPrompt && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>🌱</div>
              <h3>Farm Boundary Saved!</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Your regional soil data has been analyzed successfully.</p>
              <p>Would you like to assign a crop to this farm to see accurate fertilizer requirements?</p>
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalButtonSecondary} 
                onClick={() => setShowCropPrompt(false)}
              >
                Maybe Later
              </button>
              <button 
                className={styles.modalButtonPrimary} 
                onClick={() => router.push(`/onboarding/crops?farmId=${selectedFarmId}`)}
              >
                Choose Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Dashboard);