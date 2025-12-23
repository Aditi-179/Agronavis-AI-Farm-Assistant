import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Dashboard.module.css';
import WeatherBlock from './WeatherBlock';

interface Scheme {
  name: string;
  provider: string;
}

interface Farm {
  id: string;
  name: string;
  total_area: number;
  soil_type?: string;
  irrigation_type?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  crops?: any[];
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('crop');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  
  // Sample schemes for the UI
  const schemes: Scheme[] = [
    { name: 'AIF-Scheme', provider: 'Government' },
    { name: 'AHIDF', provider: 'Government' },
    { name: 'PMFME Scheme', provider: 'Government' },
  ];

  // Navigate to weather forecast page
  const navigateToWeatherForecast = () => {
    router.push('/weather-forecast');
  };
  
  // Navigate to camera page
  const openCamera = () => {
    console.log('Opening camera page...');
    router.push('/camera');
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('dashboard.welcome')}</h1>
        <div className={styles.dateTime}>
          
        </div>
      </div>

      {/* Weather Card */}
      <div className={styles.weatherCard} onClick={navigateToWeatherForecast}>
        <WeatherBlock compact={true} />
      </div>

      {/* Cards Grid */}
      <div className={styles.cardsGrid}>
        {/* E-Crop Diagnosis Card */}
        <div className={styles.card} onClick={openCamera}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>{t('dashboard.cropDiagnosis.title')}</div>
          </div>
          <div className={styles.diagnosisContent}>
            <h3>{t('dashboard.cropDiagnosis.testYourCrop')}</h3>
            
            <div className={styles.diagnosisSteps}>
              <div className={styles.diagnosisStep}>
                <div className={`${styles.stepIcon} ${styles.stepIconGlow}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256" className={styles.iconImage}>
                    <path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"></path>
                  </svg>
                </div>
                <div className={styles.stepText}>{t('dashboard.cropDiagnosis.steps.takePicture')}</div>
              </div>
              
              <div className={styles.stepArrow}>→</div>
              
              <div className={styles.diagnosisStep}>
                <div className={`${styles.stepIcon} ${styles.stepIconRipple}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="48" height="48" className={styles.iconImage}>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256" className={styles.iconImage}>
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

        {/* Features Grid */}
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

      {/* Bottom Navigation */}
      <div className={styles.bottomNav}>
        <div 
          className={`${styles.navItem} ${activeTab === 'crop' ? styles.active : ''}`}
          onClick={() => setActiveTab('crop')}
        >
          <div className={styles.navIcon}>🌾</div>
          <div className={styles.navText}>{t('dashboard.navigation.crop')}</div>
        </div>
        <div 
          className={`${styles.navItem} ${activeTab === 'community' ? styles.active : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <div className={styles.navIcon}>👥</div>
          <div className={styles.navText}>{t('dashboard.navigation.community')}</div>
        </div>
        <div 
          className={`${styles.navItem} ${activeTab === 'shop' ? styles.active : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          <div className={styles.navIcon}>🛒</div>
          <div className={styles.navText}>{t('dashboard.navigation.shop')}</div>
        </div>
        <div 
          className={`${styles.navItem} ${activeTab === 'you' ? styles.active : ''}`}
          onClick={() => setActiveTab('you')}
        >
          <div className={styles.navIcon}>👤</div>
          <div className={styles.navText}>{t('dashboard.navigation.you')}</div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);