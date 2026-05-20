import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { db } from './firebase_config.js';

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

async function LayTungMon(TenSP, TenKho = "SanPham-LinhKien") 
{
    try 
    {
        console.log(`🔍 Đang lục kho [${TenKho}] tìm món: ${TenSP}...`);

        const danhSachHang = await layDataTuKho(TenKho, where("Ten", "==", TenSP));

        if (danhSachHang.length === 0) 
        {
            $("#khu-vuc-san-pham").append(`<h3 class="text-white w-100 mt-3">❌ Không tìm thấy [${TenSP}] trong kho [${TenKho}] sếp ơi!</h3>`);
            return null;
        }
        
        let sp = danhSachHang[0];
        let GiaTien = sp.Gia.toLocaleString('vi-VN');

        // 👇 ĐÃ NÂNG CẤP NÚT Ở ĐÂY: Thêm class 'btn-them-gio' và nhét các thẻ 'data-' vào
        let htmlShop = `
            <div class="col-md-3 mb-4">
                <div class="card h-100 card-dak-tech">
                    <img src="${sp.Anh}" class="card-img-top p-2" alt="${sp.Ten}" style="object-fit: contain; height: 200px;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-truncate" title="${sp.Ten}">${sp.Ten}</h5>
                        <p class="card-text ">${GiaTien} VNĐ</p>
                        <button class="btn btn-outline-info mt-auto btn-them-gio"
                                data-id="${sp.id}" 
                                data-ten="${sp.Ten}" 
                                data-gia="${sp.Gia}" 
                                data-hinh="${sp.Anh}">
                            🛒 Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        `;

        $("#khu-vuc-san-pham").append(htmlShop);

    } 
    catch (error) 
    {
        console.error("❌ Lỗi in sản phẩm:", error);
    }
}

$(document).ready(function() 
{

    LayTungMon("Bộ vi xử lý Intel Core i9 14900KS <br> Turbo up to 6.2GHz / 24 Nhân 32 Luồng <br> 36MB / LGA 1700");
    LayTungMon("CPU AMD Ryzen 9 9950X3D <br> (16C-32T | Up to 5.7GHz | 144MB <br> Radeon Graphics 2CUs - RDNA 2.0 | AM5)");
    LayTungMon("Màn hình Samsung Odyssey <br> G5 LS32CG552 32 inch", "SanPham-PhuKien");
    LayTungMon("Card Màn Hình Gigabyte GeForce <br> RTX 5090 Gaming Trio OC 32GB GDDR7", "SanPham-LinhKien");
});