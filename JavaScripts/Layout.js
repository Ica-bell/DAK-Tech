import { app, db } from './firebase_config.js';
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

window.tenKhachHang = "Khách";
window.isLoggedIn = false; // 👇 BIẾN KIỂM TRA ĐĂNG NHẬP

// --- CẬP NHẬT HIỂN THỊ GIỎ HÀNG ---
window.CapNhatHienThiGioHang = function() 
{
    let GioHangDAK = JSON.parse(localStorage.getItem('DAK_CART')) || [];

    let tongSoLuong = 0;
    GioHangDAK.forEach(item => tongSoLuong += item.soLuong);

    const svgRong = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`;
    
    const svgDac = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`;

    // 🔥 Kích hoạt mode thao túng tâm lý:
    if (tongSoLuong > 0) {
        $('#cart-badge').text(tongSoLuong).fadeIn(200); // Hiện số
        $('#cart-icon-svg').html(svgDac); // Đổi sang giỏ đựng hàng (fill trắng)
    } else {
        $('#cart-badge').fadeOut(200); // Giấu số
        $('#cart-icon-svg').html(svgRong); // Đổi về giỏ rỗng (chỉ có viền)
    }
    
    let khungGioHang = $('.GiaoDien-GioHang'); 

    if (GioHangDAK.length === 0) 
    {
        khungGioHang.html(`
            <h3 style="text-align: center; margin-top: 20px;">🛒 Giỏ hàng của ${window.tenKhachHang}</h3>
            <hr>
            <p style="text-align: center; color: darkgray;">Giỏ hàng hiện đang trống. Mua sắm đi ${window.tenKhachHang} ơi!</p>
        `);
    } 
    else 
    {
        let htmlContent = `
            <h3 style="text-align: center; margin-top: 20px;">🛒 Giỏ hàng của ${window.tenKhachHang}</h3>
            <hr>
            <div class="danh-sach-gio-hang" style="max-height: 320px; overflow-y: auto; overflow-x: hidden; padding-right: 5px;">
        `;
        let tongTien = 0;
        GioHangDAK.forEach(function(monHang) 
        {
            let thanhTien = monHang.gia * monHang.soLuong;
            tongTien += thanhTien;
            
            htmlContent += `
                <div class="gio-hang-item d-flex align-items-center mb-3 border p-2 bg-dark text-white rounded position-relative">
                    <img src="${monHang.anh}" width="60" height="60" class="me-2 bg-white p-1 rounded" style="object-fit: contain;">
                    
                    <div class="thong-tin flex-grow-1">
                        <h6 class="mb-0 text-truncate" style="max-width: 120px;">${monHang.ten}</h6>
                        <span class="text-secondary" style="font-size: 0.8em; transform: translateX(-10px) !important;">${monHang.gia.toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div class="d-flex align-items-center bg-secondary rounded px-1 me-2" style="transform: translateX(-40px);">
                        <button class="btn btn-sm text-white p-1 btn-giam-qty" data-id="${monHang.id}">-</button>
                        <span class="mx-2 fw-bold text-warning">${monHang.soLuong}</span>
                        <button class="btn btn-sm text-white p-1 btn-tang-qty" data-id="${monHang.id}">+</button>
                    </div>

                    <div class="thanh-tien fw-bold text-success text-end pe-4" style="min-width: 85px; font-size: 0.9em; transform: translateX(-20px);">
                        ${thanhTien.toLocaleString('vi-VN')} đ
                    </div>
                    
                    <span class="btn-xoa-mon position-absolute" data-id="${monHang.id}" 
                        style="right: 8px; cursor: pointer; opacity: 0.7;" title="Xóa hẳn">🗑️</span>
                </div>
            `;
        });

        htmlContent += `</div><div class="tong-tien-khung mt-3 pt-3 border-top text-end">
                <h4>Tổng: <span class="text-danger">${tongTien.toLocaleString('vi-VN')} VNĐ</span></h4>
                <button class="btn-ThanhToan btn-primary btn-lg mt-2 w-100 fw-bold">Xem giỏ hàng</button>
            </div>`;
        khungGioHang.html(htmlContent);
    }
}

$(document).ready(function()
{
    // --- XỬ LÝ MENU BÊN TRÁI VÀ LIÊN HỆ ---
    $('#toggle-btn').click(e => 
    { 
        e.stopPropagation(); $('#menu-list').toggleClass('hien'); 
    });

    $('#toggle-btn-LienHe').click(() => 
    { 
        $('#dak-LH').toggleClass('active');
        $('#toggle-btn-LienHe').toggleClass('active'); 
    });

    // --- XỬ LÝ ẨN/HIỆN GIỎ HÀNG VÀ THÔNG BÁO ---
    $('.notification-icon').removeClass('active');
    $('.GiaoDien-ThongBao').hide();
    $('.notification').click(e => 
    {
        e.stopPropagation();
        $('.GiaoDien-ThongBao').slideToggle();
        $('.notification-icon').toggleClass('active');
    });

    // --- XỬ LÝ THÔNG TIN ---
    $('.user').off('click').on('click', function(e) 
    {
        e.stopPropagation();
        if (window.isLoggedIn) 
        {
            $('.NguoiDung').toggleClass('active');
            $('.blur').toggleClass('active');

            $('.GiaoDien-GioHang, .GiaoDien-ThongBao').slideUp();
            $('.cart-icon, .notification-icon').removeClass('active');
        }
        else 
        {
            // Nếu chưa đăng nhập thì sẽ chuyển sang trang đăng nhập
            window.location.href = "Login-Signup.html";
        }
    });

    // Click ra ngoài để đóng mọi thứ
    $(document).click(event => {
        if (!$(event.target).closest('#menu-list, #toggle-btn').length) $('#menu-list').removeClass('hien');

        if (!$(event.target).closest('#dak-LH, #toggle-btn-LienHe').length) 
        {
            $('#dak-LH').removeClass('active');
            $('#toggle-btn-LienHe').removeClass('active');
        }

        if (!$(event.target).closest('.NguoiDung, .user').length) 
        {
            $('.NguoiDung').removeClass('active');
            $('.blur').removeClass('active');
        }
    });

    $('.sub-ThongTin').hide();
    $('.sub-Settings').hide();

    $('#ThongTin').click(event => 
    {
        $('.sub-ThongTin').slideToggle(400),
        $('.arrow-tt').toggleClass('active'),
        $('#ThongTin').toggleClass('active')
    });

    $('#Settings').click(event => 
    {
        $('.sub-Settings').slideToggle(400),
        $('.arrow-st').toggleClass('active')
        $('#Settings').toggleClass('active')
    });

    // --- QUẢN LÝ ĐĂNG NHẬP (FIREBASE) ---
    const auth = getAuth(app);
    onAuthStateChanged(auth, async (user) => 
    {
        if (user) 
        {
            try 
            {
                const userDoc = await getDoc(doc(db, "TaiKhoan", user.uid));
                let tenKhach = userDoc.exists() ? userDoc.data().tenNguoiDung : "Khách hàng";
                
                window.tenKhachHang = tenKhach;
                window.isLoggedIn = true; // Bật đăng nhập
                window.CapNhatHienThiGioHang();

                // Mất thẻ <a> 
                $('.login-signup').html(`Chào, <b>${tenKhach}</b>`);
                $('.ten-nguoi-dung').text(tenKhach); // Cập nhật tên vào Sidebar

                // Nút Đăng xuất nằm trong Sidebar
                $('#btn-logout').off('click').on('click', function() 
                {
                    signOut(auth).then(() => 
                    {
                        hienThongBao("Đã đăng xuất!", "success");
                        setTimeout(() => { window.location.reload(); }, 800);
                    });
                });
            } 
            catch (error) { console.log("Lỗi:", error); }
        } 
        else 
        {
            window.tenKhachHang = "Khách";
            window.isLoggedIn = false; // Tắt cờ đăng nhập
            window.CapNhatHienThiGioHang();
            
            // Không dùng thẻ <a>
            $('.login-signup').html(`Đăng nhập/Đăng ký`);
            $('.ten-nguoi-dung').text("Khách");
        }
    });

    CapNhatHienThiGioHang();

    $(document).on('click', '.btn-ThanhToan', function(event) 
    {
        window.location.href = "GioHang.html";
    });
});

// --- THÊM SẢN PHẨM VÀO GIỎ HÀNG ---
$(document).on('click', '.btn-them-gio', function() 
{
    const sp_id = $(this).data('id');
    const sp_ten = $(this).data('ten');
    const sp_gia = Number($(this).data('gia'));
    const sp_anh = $(this).data('hinh');

    let GioHangDAK = JSON.parse(localStorage.getItem('DAK_CART')) || [];
    const monDaCo = GioHangDAK.find(item => item.id === sp_id);

    if (monDaCo) 
    {
        monDaCo.soLuong += 1; 
    } 
    else 
    {
        GioHangDAK.push({ id: sp_id, ten: sp_ten, gia: sp_gia, anh: sp_anh, soLuong: 1 });
    }

    localStorage.setItem('DAK_CART', JSON.stringify(GioHangDAK));
    if (typeof window.CapNhatHienThiGioHang === 'function') window.CapNhatHienThiGioHang();
    if (typeof window.hienThongBao === 'function') window.hienThongBao(`Đã thêm "${sp_ten}"!`, "success");
});

// --- NÚT "XÓA KHỎI GIỎ" ---
$(document).on('click', '.btn-xoa-mon', function(e) 
{
    e.stopPropagation(); 
    const sp_id = $(this).data('id'); 
    let GioHangDAK = JSON.parse(localStorage.getItem('DAK_CART')) || [];
    const monBiXoa = GioHangDAK.find(item => item.id === sp_id);
    GioHangDAK = GioHangDAK.filter(item => item.id !== sp_id);
    localStorage.setItem('DAK_CART', JSON.stringify(GioHangDAK));
    window.CapNhatHienThiGioHang();
    if (typeof window.renderShopeeCart === 'function') window.renderShopeeCart();
    if (monBiXoa && typeof window.hienThongBao === 'function') 
    {
        window.hienThongBao("Đã xóa món đồ khỏi giỏ", "error");
    }
});

// --- NÚT TĂNG (+) ---
$(document).on('click', '.btn-tang-qty', function(e) 
{
    e.stopPropagation();
    const sp_id = $(this).data('id');
    let GioHangDAK = JSON.parse(localStorage.getItem('DAK_CART')) || [];
    let monHang = GioHangDAK.find(item => item.id === sp_id);
    if (monHang) 
    {
        monHang.soLuong += 1;
        localStorage.setItem('DAK_CART', JSON.stringify(GioHangDAK));
        window.CapNhatHienThiGioHang();
        if (typeof window.renderShopeeCart === 'function') window.renderShopeeCart();
    }
});

// --- NÚT GIẢM (-) ---
$(document).on('click', '.btn-giam-qty', function(e) 
{
    e.stopPropagation();
    const sp_id = $(this).data('id');
    let GioHangDAK = JSON.parse(localStorage.getItem('DAK_CART')) || [];
    let index = GioHangDAK.findIndex(item => item.id === sp_id);
    if (index !== -1) 
    {
        if (GioHangDAK[index].soLuong > 1) 
        {
            GioHangDAK[index].soLuong -= 1;
        } 
        else 
        {
            GioHangDAK.splice(index, 1); 
            window.hienThongBao("Đã xóa món đồ khỏi giỏ", "info");
        }
        localStorage.setItem('DAK_CART', JSON.stringify(GioHangDAK));
        window.CapNhatHienThiGioHang();
        if (typeof window.renderShopeeCart === 'function') window.renderShopeeCart();
    }
});

// --- HỆ THỐNG THÔNG BÁO TOAST ---
$(document).ready(function() 
{
    if ($('#toast-container').length === 0) {
        $('body').append('<div id="toast-container" style="position: fixed; top: 80px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px;"></div>');
    }
});

window.hienThongBao = function(loiNhan, loai = 'success') 
{
    let icon = loai === 'success' ? '✅' : (loai === 'error' ? '❌' : '🔔');
    let toastHTML = $(`<div class="dak-toast ${loai}"><span style="margin-right: 12px; font-size: 1.4em;">${icon}</span><span>${loiNhan}</span></div>`);
    $('#toast-container').append(toastHTML);
    setTimeout(() => toastHTML.addClass('show'), 10);
    setTimeout(() => 
    {
        toastHTML.removeClass('show');
        setTimeout(() => toastHTML.remove(), 400);
    }, 3000);
};