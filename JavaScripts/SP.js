import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { db } from './firebase_config.js';

// --- Gán khu vực ---
const BanDoKhuVuc = 
{
    "Case": ".case-sp-linhkien",
    "Cooler": ".cooler-sp-linhkien",
    "CPU": ".cpu-sp-linhkien",
    "HardDisk - HDD": ".harddisk-sp-linhkien", 
    "HardDisk - SSD": ".harddisk-sp-linhkien",     
    "MainBoard": ".mainboard-sp-linhkien",
    "PSU": ".psu-sp-linhkien",
    "RAM": ".ram-sp-linhkien",
    "VGA": ".vga-sp-linhkien",
    "Monitor": ".monitor-sp-phukien",   
    "KeyBoard": ".keyboard-sp-phukien", 
    "Mouse": ".mouse-sp-phukien"
};

// --- Hàm lấy dữ liệu từ 2 kho (SanPham-LinhKien và SanPham-PhuKien) ---
async function layDataTuKho(tenKho, dieuKienLoc = null) 
{
    try 
    {
        let queryCongViec = dieuKienLoc ? query(collection(db, tenKho), dieuKienLoc) : collection(db, tenKho);
        const querySnapshot = await getDocs(queryCongViec);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } 
    catch (error) 
    {
        console.error(`❌ Lỗi kho ${tenKho}:`, error);
        return [];
    }
}

// --- Hàm phân bổ sản phẩm vào khu vực tương ứng ---
async function PhanBoSanPham() 
{
    // Lấy hàng từ cả 2 kho
    const query1 = await getDocs(collection(db, "SanPham-LinhKien"));
    const query2 = await getDocs(collection(db, "SanPham-PhuKien"));
    
    const tatCa = [...query1.docs, ...query2.docs];

    tatCa.forEach(doc => 
    {
        let sp = doc.data();
        let khuVuc = BanDoKhuVuc[sp.Loai];

        if (khuVuc) 
        {
            let tenAnToan = sp.Ten.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            // 👇 CHỖ NÀY ĐÃ ĐƯỢC NÂNG CẤP: Gắn thẻ data- và class btn-them-gio
            let html = `
                <div class="col-md-3 mb-4">
                    <div class="card h-100 card-dak-tech" style = "border-radius: 12px;">
                        <img src="${sp.Anh}" class="card-img-top p-2" style="object-fit: contain; height: 200px;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title text-truncate" title="${tenAnToan}">${sp.Ten}</h5>
                            <p class="card-text">${sp.Gia.toLocaleString('vi-VN')} VNĐ</p>
                            <button class="btn btn-outline-info mt-auto btn-them-gio" 
                                    data-id="${doc.id}" 
                                    data-ten="${tenAnToan}" 
                                    data-gia="${sp.Gia}" 
                                    data-hinh="${sp.Anh}">
                                🛒 Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>`;
            $(khuVuc).append(html);
        }
    });
}

// --- Chạy hàm khi trang tải xong ---
$(document).ready(async function() 
{
    PhanBoSanPham(); // Đổ đồ từ Firebase xuống web
    CapNhatHienThiGioHang(); // Lục kho LocalStorage in ra Giỏ Hàng
});