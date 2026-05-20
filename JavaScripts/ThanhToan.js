$(document).ready(function() {
    
    // Mặc định phí ship (như hình m gửi)
    const phiShip = 43900; 

    // --- HÀM VẼ DANH SÁCH MÓN HÀNG ---
    function renderCheckoutItems() {
        let cart = JSON.parse(localStorage.getItem('DAK_CHECKOUT')) || [];
        let container = $('#checkout-items-container');
        container.empty();

        // Nếu không có sản phẩm thì cho về trang giỏ hàng
        if (cart.length === 0) {
            window.hienThongBao("Chọn ít nhất 1 món để thanh toán nhé", "error");
            setTimeout(() => { window.location.href = "GioHang.html"; }, 1500);
            return;
        }

        let html = '';
        let tongTienHang = 0;
        let tongSoLuong = 0;

        cart.forEach(item => {
            let thanhtien = item.gia * item.soLuong;
            tongTienHang += thanhtien;
            tongSoLuong += item.soLuong;

            html += `
            <div class="checkout-item-row">
                <div class="col-prod d-flex align-items-center">
                    <img src="${item.anh}" alt="${item.ten}">
                    <div class="prod-name-co">${item.ten}</div>
                </div>
                <div class="col-price">${item.gia.toLocaleString('vi-VN')}₫</div>
                <div class="col-quantity">${item.soLuong}</div>
                <div class="col-total">${thanhtien.toLocaleString('vi-VN')}₫</div>
            </div>`;
        });

        container.html(html);

        // Cập nhật mấy con số tổng tiền
        $('#total-items-count').text(tongSoLuong);
        $('#subtotal-price').text(tongTienHang.toLocaleString('vi-VN') + '₫');
        
        $('#summary-subtotal').text(tongTienHang.toLocaleString('vi-VN') + '₫');
        $('#summary-shipping').text(phiShip.toLocaleString('vi-VN') + '₫');
        
        let tongThanhToan = tongTienHang + phiShip;
        $('#summary-final-total').text(tongThanhToan.toLocaleString('vi-VN') + '₫');
    }

    renderCheckoutItems();

    // --- NÚT ĐẶT HÀNG ---
    $('#btn-place-order').click(function() {
        window.hienThongBao("Đã thanh toán! Đơn hàng sẽ được giao đến bạn trong 4-5 ngày tới", "success");
        
        // 1. Mở kho chính và kho tạm ra
        let mainCart = JSON.parse(localStorage.getItem('DAK_CART')) || [];
        let checkoutCart = JSON.parse(localStorage.getItem('DAK_CHECKOUT')) || [];
        
        // 2. Lọc bỏ mấy món đã mua khỏi giỏ hàng chính
        mainCart = mainCart.filter(mainItem => !checkoutCart.some(checkItem => checkItem.id === mainItem.id));
        
        // 3. Cập nhật lại kho chính và xoá bỏ kho tạm
        localStorage.setItem('DAK_CART', JSON.stringify(mainCart));
        localStorage.removeItem('DAK_CHECKOUT');
        
        // 4. Update cái giỏ nhỏ
        if (typeof window.CapNhatHienThiGioHang === 'function') window.CapNhatHienThiGioHang();
        
        // Ép về trang chủ
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    });
});