# Google Forms Integration Setup Guide

## 📋 Step 1: Create Google Sheets

### Sheet Structure
Create **ONE Google Sheet** with the following tabs:

1. **Shipper Intakes** - Get-Started page shippers
2. **Carrier Intakes** - Get-Started page carriers
3. **Fleet Intakes** - Get-Started page fleet operators
4. **Microhub Intakes** - Get-Started page microhub partners
5. **Institutional Intakes** - Get-Started page institutions
6. **Individual Carriers** - Carrier page individual movers (individual-carrier)
7. **Fleet Operators** - Carrier page fleet operators (fleet-operator)
8. **Capital Requests** - Capital page investor requests
9. **Shipper Early Access** - Shipper page early access
10. **Newsletter Subscribers** - Footer newsletter (all pages)

**Column Headers for each sheet:**
- Timestamp
- Page/Source
- Role
- Full Name
- Email
- Phone (if applicable)
- Company/Organization
- Location
- Message/Notes
- Other relevant fields

---

## 🔧 Step 2: Deploy Apps Script

### For Get-Started Forms (KEEP EXISTING)
**Already set up with:**
```
https://script.google.com/macros/s/AKfycbx4DcGu_z-fVAEmTLzUEWj6v8oahhoV1SNskeVwgIlHRTjmDzR4E591_0oHZtQsnrbA/exec
```

### For Carrier + Capital + Newsletter (NEW - DEPLOY BELOW)

**Option A: Setup Instructions**
1. Go to Google Sheets → Create new spreadsheet
2. Click **Extensions** → **Apps Script**
3. **Delete default code**, paste the code from `CARRIER_CAPITAL_NEWSLETTER_SCRIPT.gs` (provided below)
4. Click **Deploy** → **New deployment**
5. Select type: **Web app**
6. Execute as: Your email
7. Allow access to: Anyone
8. Copy the deployment URL
9. Update the `APPS_SCRIPT_URL` in carrier.html, capital.html, and your newsletter forms

---

## 📝 Apps Script Code

### Main Script (for Carrier, Capital, Newsletter)
```javascript
// This script handles form submissions from:
// - Carrier Page (individual-carrier, fleet-operator)
// - Capital Page (capital-request)
// - Newsletter (all pages)

const SHEET_ID = "YOUR_SHEET_ID_HERE"; // Replace with your Google Sheet ID

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    const payload = JSON.parse(e.postData.contents);
    
    const formType = payload.form_type || "unknown";
    const sheetName = getSheetName(formType);
    
    if (!sheetName) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Unknown form type"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const targetSheet = sheet.getSheetByName(sheetName);
    if (!targetSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Sheet not found"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Add header row if empty
    if (targetSheet.getLastRow() === 0) {
      const headers = getHeaders(formType);
      targetSheet.appendRow(headers);
    }
    
    // Prepare row data
    const rowData = formatRowData(payload, formType);
    targetSheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data submitted successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetName(formType) {
  const mapping = {
    "individual-carrier": "Individual Carriers",
    "fleet-operator": "Fleet Operators",
    "capital-request": "Capital Requests",
    "shipper-early-access": "Shipper Early Access",
    "newsletter": "Newsletter Subscribers"
  };
  return mapping[formType] || null;
}

function getHeaders(formType) {
  const headers = {
    "individual-carrier": [
      "Timestamp", "Page", "Role", "Full Name", "Email", "Phone", 
      "Vehicle Type", "Availability", "Notes"
    ],
    "fleet-operator": [
      "Timestamp", "Page", "Role", "Full Name", "Email", "Phone",
      "Company", "Fleet Size", "Service Type", "Notes"
    ],
    "capital-request": [
      "Timestamp", "Page", "Full Name", "Organization", "Role",
      "Focus Area", "Email", "Additional Notes"
    ],
    "shipper-early-access": [
      "Timestamp", "Page", "Email", "Company", "Notes"
    ],
    "newsletter": [
      "Timestamp", "Page", "Email"
    ]
  };
  return headers[formType] || ["Timestamp", "Data"];
}

function formatRowData(payload, formType) {
  const timestamp = new Date().toISOString();
  const page = payload.page || "unknown";
  
  const mapping = {
    "individual-carrier": [
      timestamp, page, payload.role || "individual-carrier",
      payload.full_name || "", payload.email || "", payload.phone || "",
      payload.vehicle_type || "", payload.availability || "", payload.notes || ""
    ],
    "fleet-operator": [
      timestamp, page, payload.role || "fleet-operator",
      payload.full_name || "", payload.email || "", payload.phone || "",
      payload.company || "", payload.fleet_size || "", payload.service_type || "", payload.notes || ""
    ],
    "capital-request": [
      timestamp, page, payload.full_name || "", payload.organization || "",
      payload.role || "", payload.focus_area || "", payload.email || "",
      payload.additional_notes || ""
    ],
    "shipper-early-access": [
      timestamp, page, payload.email || "", payload.company || "", payload.notes || ""
    ],
    "newsletter": [
      timestamp, page, payload.email || ""
    ]
  };
  
  return mapping[formType] || [timestamp, JSON.stringify(payload)];
}
```

---

## 🔗 Updated Form URLs

Replace `APPS_SCRIPT_URL` with your deployed Apps Script URL in:

1. **carrier.html** - Both forms
2. **capital.html** - Capital request form
3. **shipper.html** - Early access form
4. **All footer newsletter forms** - Newsletter subscription

---

## ✅ Testing Checklist

- [ ] Get-Started forms still work (existing script)
- [ ] Carrier page forms submit to new sheet
- [ ] Capital page form submits to new sheet
- [ ] Shipper early access form submits to new sheet
- [ ] Newsletter form submits to new sheet
- [ ] All submissions appear in correct Google Sheet tabs

---

## 🚀 Deployment

1. Deploy Apps Script as "Web App"
2. Test with each form type
3. Verify data appears in correct sheets
4. Monitor for any errors in Apps Script logs

