-- Drop the old table we created
DROP TABLE IF EXISTS public.regional_soil_data;

-- Create the new table matching all 34 columns from the CSV
CREATE TABLE public.regional_soil_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    block TEXT,
    scheme NUMERIC, 
    cycle TEXT,
    n_high INTEGER DEFAULT 0,
    n_medium INTEGER DEFAULT 0,
    n_low INTEGER DEFAULT 0,
    p_high INTEGER DEFAULT 0,
    p_medium INTEGER DEFAULT 0,
    p_low INTEGER DEFAULT 0,
    k_high INTEGER DEFAULT 0,
    k_medium INTEGER DEFAULT 0,
    k_low INTEGER DEFAULT 0,
    oc_high INTEGER DEFAULT 0,
    oc_medium INTEGER DEFAULT 0,
    oc_low INTEGER DEFAULT 0,
    ph_alkaline INTEGER DEFAULT 0,
    ph_acidic INTEGER DEFAULT 0,
    ph_neutral INTEGER DEFAULT 0,
    ec_nonsaline INTEGER DEFAULT 0,
    ec_saline INTEGER DEFAULT 0,
    s_sufficient INTEGER DEFAULT 0,
    s_deficient INTEGER DEFAULT 0,
    fe_sufficient INTEGER DEFAULT 0,
    fe_deficient INTEGER DEFAULT 0,
    zn_sufficient INTEGER DEFAULT 0,
    zn_deficient INTEGER DEFAULT 0,
    cu_sufficient INTEGER DEFAULT 0,
    cu_deficient INTEGER DEFAULT 0,
    b_sufficient INTEGER DEFAULT 0,
    b_deficient INTEGER DEFAULT 0,
    mn_sufficient INTEGER DEFAULT 0,
    mn_deficient INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Re-apply the performance index
CREATE INDEX IF NOT EXISTS idx_regional_soil_state_district 
ON public.regional_soil_data(LOWER(state), LOWER(district));