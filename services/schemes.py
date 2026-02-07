# Government schemes - real info from official sources (PM-Kisan, PMFBY, KCC, etc.)
# https://pmkisan.gov.in https://pmfby.gov.in

SCHEMES = [
    {
        "id": "pm_kisan",
        "name_en": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "name_hi": "प्रधानमंत्री किसान सम्मान निधि",
        "description_en": "Income support of ₹6,000 per year in three equal instalments to land-holding farmer families. Direct Benefit Transfer (DBT).",
        "description_hi": "जमीन धारक किसान परिवारों को प्रति वर्ष ₹6,000 तीन किस्तों में। डायरेक्ट बेनिफिट ट्रांसफर (DBT)।",
        "link": "https://pmkisan.gov.in",
        "eligibility_en": "Land-holding farmer families (subject to exclusions).",
        "eligibility_hi": "जमीन धारक किसान परिवार (कुछ अपवाद)।",
    },
    {
        "id": "pmfby",
        "name_en": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "name_hi": "प्रधान मंत्री फसल बीमा योजना",
        "description_en": "Crop insurance against non-preventable risks. Low premium: 2% (kharif), 1.5% (rabi), 5% (commercial/horticulture).",
        "description_hi": "अप्रत्याशित जोखिम के खिलाफ फसल बीमा। प्रीमियम: 2% (खरीफ), 1.5% (रबी), 5% (वाणिज्यिक/बागवानी)।",
        "link": "https://pmfby.gov.in",
        "eligibility_en": "All farmers growing notified crops in notified areas.",
        "eligibility_hi": "अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले किसान।",
    },
    {
        "id": "kcc",
        "name_en": "Kisan Credit Card (KCC)",
        "name_hi": "किसान क्रेडिट कार्ड",
        "description_en": "Credit for cultivation, inputs, and post-harvest expenses. Interest subvention. Short-term loans at concessional rates.",
        "description_hi": "खेती, निवेश और फसल के बाद के खर्च के लिए ऋण। ब्याज अनुदान। रियायती दरों पर अल्पकालिक ऋण।",
        "link": "https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=11133",
        "eligibility_en": "Individual farmers, tenant farmers, sharecroppers, and joint liability groups.",
        "eligibility_hi": "व्यक्तिगत किसान, किरायेदार किसान, बटाईदार और संयुक्त देयता समूह।",
    },
    {
        "id": "soil_health",
        "name_en": "Soil Health Card Scheme",
        "name_hi": "मृदा स्वास्थ्य कार्ड योजना",
        "description_en": "Free soil testing every 2 years. Card shows nutrient status and recommended doses of fertilisers.",
        "description_hi": "हर 2 साल मुफ्त मिट्टी परीक्षण। कार्ड में पोषक स्थिति और उर्वरक की सिफारिश।",
        "link": "https://soilhealth.dac.gov.in",
        "eligibility_en": "All farmers. Implemented by state governments.",
        "eligibility_hi": "सभी किसान। राज्य सरकारों द्वारा लागू।",
    },
    {
        "id": "namo_drone",
        "name_en": "NAMO Drone Didi / Drone Subsidy",
        "name_hi": "नमो ड्रोन दीदी",
        "description_en": "Subsidy for purchase of drones for agricultural spraying. Supports FPOs and rural women.",
        "description_hi": "कृषि छिड़काव के लिए ड्रोन खरीद पर सब्सिडी। FPO और ग्रामीण महिलाओं को समर्थन।",
        "link": "https://agriculture.gov.in",
        "eligibility_en": "FPOs, rural women entrepreneurs, as per scheme guidelines.",
        "eligibility_hi": "FPO, ग्रामीण महिला उद्यमी, योजना दिशानिर्देश के अनुसार।",
    },
]


def get_schemes(lang="en"):
    """Return schemes with name and description in requested language where available."""
    out = []
    for s in SCHEMES:
        name = s.get(f"name_{lang}") or (s["name_hi"] if lang == "hi" else s["name_en"])
        desc = s.get(f"description_{lang}") or (s["description_hi"] if lang == "hi" else s["description_en"])
        elig = s.get(f"eligibility_{lang}") or (s["eligibility_hi"] if lang == "hi" else s.get("eligibility_en", ""))
        out.append({
            "id": s["id"],
            "name": name,
            "description": desc,
            "eligibility": elig,
            "link": s["link"],
        })
    return out
