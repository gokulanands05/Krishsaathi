# Satellite / NDVI - links to Bhuvan/NRSC and optional tile or NDVI summary
# https://bhuvan-app1.nrsc.gov.in https://data.gov.in/resource/oceansat-2ocm-ndvi-india-coverage

def get_satellite_info(lat=None, lon=None, state=None):
    """Return links and optional NDVI/tile info for agriculture."""
    return {
        "bhuvan_portal": "https://bhuvan-app1.nrsc.gov.in/",
        "ndvi_data_portal": "https://www.data.gov.in/resource/oceansat-2ocm-ndvi-india-coverage",
        "description_en": "Use Bhuvan and data.gov.in for NDVI and crop condition maps. Oceansat-2 OCM NDVI available at 1 km resolution.",
        "description_hi": "NDVI और फसल स्थिति मानचित्र के लिए भुवन और data.gov.in का उपयोग करें। 1 किमी रिज़ॉल्यूशन पर Oceansat-2 OCM NDVI उपलब्ध।",
    }
