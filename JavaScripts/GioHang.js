$(document).ready(function() 
{
    window.renderShopeeCart();

    // 1. Nút Xóa Từng Món
    $(document).on('click', '.btn-delete-item', function() 
    {
        const id = $(this).data('id');
        let cart = JSON.parse(localStorage.getItem('DAK_CART')) || [];
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('DAK_CART', JSON.stringify(cart));
        
        window.renderShopeeCart();
        if (typeof window.CapNhatHienThiGioHang === 'function')
        {
            window.CapNhatHienThiGioHang();
        }
        
        window.hienThongBao("Đã xóa sản phẩm", "info"); 
    });

    // 2. Tăng Giảm số lượng
    $(document).on('click', '.btn-qty-shopee', function() 
    {
        const id = $(this).data('id');
        const action = $(this).data('action');
        let cart = JSON.parse(localStorage.getItem('DAK_CART')) || [];
        let item = cart.find(i => i.id === id);
        
        if (item) 
            {
            if (action === 'plus') 
            {
                item.soLuong += 1;
            } 
            else if (action === 'minus' && item.soLuong > 1) 
            {
                item.soLuong -= 1;
            }
            localStorage.setItem('DAK_CART', JSON.stringify(cart));
            
            window.renderShopeeCart();
            if (typeof window.CapNhatHienThiGioHang === 'function') window.CapNhatHienThiGioHang();
        }
    });

    // 3. Checkbox: Chọn Tất Cả
    $('#check-all-top, #check-all-bottom').change(function() 
    {
        let isChecked = $(this).prop('checked');
        $('.item-checkbox').prop('checked', isChecked);
        $('#check-all-top').prop('checked', isChecked);
        $('#check-all-bottom').prop('checked', isChecked);
        tinhTienThanhToan();
    });

    // 4. Checkbox: Chọn Từng Món
    $(document).on('change', '.item-checkbox', function() 
    {
        let allChecked = $('.item-checkbox:checked').length === $('.item-checkbox').length && $('.item-checkbox').length > 0;
        $('#check-all-top, #check-all-bottom').prop('checked', allChecked);
        tinhTienThanhToan();
    });

   // 5. Xóa các mục đã được Check
    $('#btn-delete-selected').click(function() 
    {
        let cart = JSON.parse(localStorage.getItem('DAK_CART')) || [];
        let deletedCount = 0;

        $('.item-checkbox:checked').each(function() 
        {
            const id = $(this).data('id');
            cart = cart.filter(item => item.id !== id);
            deletedCount++;
        });

        if(deletedCount > 0) {
            localStorage.setItem('DAK_CART', JSON.stringify(cart));
            
            window.renderShopeeCart();
            if (typeof window.CapNhatHienThiGioHang === 'function') window.CapNhatHienThiGioHang();
            
            window.hienThongBao(`Đã xóa ${deletedCount} sản phẩm`, "info");
        } else {
            window.hienThongBao(`Chưa có sản phẩm trong giỏ!`, "error");
        }
    });
});

// --- HÀM VẼ GIỎ HÀNG RA MÀN HÌNH ---
    window.renderShopeeCart = function()
    {
        let cart = JSON.parse(localStorage.getItem('DAK_CART')) || [];
        let container = $('#cart-items-container');
        container.empty();

        if (cart.length === 0) 
        {
            container.html('<div style="text-align:center; padding: 60px; color: white; font-size: 22px; font-weight: bold;">Giỏ hàng hiện còn rất nhiều chỗ, hãy lựa vài món mình thích nhé!</div>');
            $('#check-all-top, #check-all-bottom').prop('checked', false).prop('disabled', true);
            tinhTienThanhToan();
            return;
        }

        $('#check-all-top, #check-all-bottom').prop('disabled', false);
        let html = '';
        
        cart.forEach(item => 
        {
            let thanhtien = item.gia * item.soLuong;
            html += `
            <div class="cart-item-row">
                <div class="col-checkbox">
                    <input type="checkbox" class="item-checkbox" data-id="${item.id}" data-price="${thanhtien}" data-qty="${item.soLuong}" checked>
                </div>
                <div class="col-product">
                    <img src="${item.anh}" alt="${item.ten}">
                    <div class="prod-name">${item.ten}</div>
                </div>
                <div class="col-price">${item.gia.toLocaleString('vi-VN')}đ</div>
                <div class="col-quantity">
                    <div class="qty-controls">
                        <button class="btn-qty-shopee" data-action="minus" data-id="${item.id}">-</button>
                        <input type="text" value="${item.soLuong}" readonly>
                        <button class="btn-qty-shopee" data-action="plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="col-total">${thanhtien.toLocaleString('vi-VN')}đ</div>
                <div class="col-action">
                    <span class="btn-delete-item" data-id="${item.id}">Xóa</span>
                </div>
            </div>`;
        });
        
        container.html(html);
        
        $('.item-checkbox, #check-all-top, #check-all-bottom').prop('checked', true);
        tinhTienThanhToan();
    }

// --- HÀM TÍNH TỔNG TIỀN DỰA TRÊN CHECKBOX ĐANG CHỌN ---
    window.tinhTienThanhToan = function() 
    {
        let total = 0;
        let totalItems = 0;
        
        $('.item-checkbox:checked').each(function() 
        {
            total += $(this).data('price');
            totalItems += $(this).data('qty');
        });

        $('#total-selected-count').text(totalItems);
        $('#total-selected-count-label').text($('.item-checkbox:checked').length);
        $('#final-total-price').text(total.toLocaleString('vi-VN') + 'đ');
    }
    
    // Nút Thanh Toán (Chuyển qua trang ThanhToan.html)
    $('#btn-checkout-shoopee').click(function() 
    {
        // Lấy dữ liệu những checkbox đang được tick
        let checkedItems = $('.item-checkbox:checked');
        
        if(checkedItems.length > 0) 
        {
            let cart = JSON.parse(localStorage.getItem('DAK_CART')) || [];
            let checkoutItems = []; // Tạo 1 cái kho tạm
            
            // Duyệt qua mấy món được tick, tìm trong kho chính rồi cho vô kho tạm
            checkedItems.each(function() 
            {
                let id = $(this).data('id');
                let foundItem = cart.find(item => item.id === id);
                if(foundItem) checkoutItems.push(foundItem);
            });

            // Lưu kho tạm vô localStorage
            localStorage.setItem('DAK_CHECKOUT', JSON.stringify(checkoutItems));
            
            // Qua trang thanh toán
            window.location.href = "ThanhToan.html";
        } 
        else 
        {
            window.hienThongBao("Vui lòng chọn ít nhất 1 món để thanh toán nha!", "error");
        }
    });
    $('#btn-checkout-shoopee').click(event => {
        window.location.href = "ThanhToan.html";
    });