import { app, db } from './firebase_config.js'; 

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

import { doc, setDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

$(document).ready(function() 
{
    // --- CHUYỂN FORM ---
    $('#go-to-signup').click(function(e) 
    {
        e.preventDefault(); 
        $('#login-form').hide(300);
        $('#signup-form').show(300);
    });

    $('#go-to-login').click(function(e) 
    {
        e.preventDefault();
        $('#signup-form').hide(300);
        $('#login-form').show(300);
    });

    const auth = getAuth(app);

    // --- XỬ LÝ NÚT ĐĂNG KÝ ---
    $('#signup-button').click(function() 
    {
        const email = $('#signup-email').val();
        const password = $('#signup-password').val();
        const username = $('#signup-name').val();
        const cfpassword = $('#confirm-signup-password').val();
        
        if(password == cfpassword)
            {
                createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => 
                    {
                        const user = userCredential.user;
                        const time = new Date();
                        const formattedTime = time.toLocaleString('vi-VN');
                        // Lưu tên vào Firestore
                        await setDoc(doc(db, "TaiKhoan", user.uid), 
                        {
                            tenNguoiDung: username,
                            email: email,
                            ngayTao: formattedTime,
                            matKhau: password
                        });

                        hienThongBao("🎉 Đăng ký thành công!", "success");
                        setTimeout(() => {
                            window.location.href = "index.html"
                        }, 3500);
                        
                    })
                .catch((error) => 
                    {
                        if (error.code === 'auth/email-already-in-use') 
                            {
                                hienThongBao("Email này đã tồn tại, vui lòng sử dụng email khác hoặc đăng nhập", "error");
                            }
                            else if (error.code === 'auth/weak-password') 
                                {
                                    hienThongBao("Mật khẩu quá yếu, phải nhập tối thiểu 6 ký tự", "error");
                                }
                            else if (error.code === 'auth/invalid-email') 
                                {       
                                    hienThongBao("Định dạng email lỗi!", "error");
                                }
                            else 
                                {
                                    hienThongBao("Lỗi rùi: " + error.message, "error");
                                }
                    });
            }
            else
            {
                hienThongBao("Mật khẩu không trùng khớp vui lòng nhập lại", "error");
            }
        
    });

    // --- XỬ LÝ NÚT ĐĂNG NHẬP ---
    $('#login-button').click(function() 
    {
        const email = $('#login-email').val();
        const password = $('#login-password').val();

        signInWithEmailAndPassword(auth, email, password)
            .then(() => 
            {
                hienThongBao("Đăng nhập thành công!", "success");
                setTimeout(() => 
                {
                    window.location.href = "index.html"; 
                }, 3500)
                
            })
            .catch((error) => hienThongBao("Sai email hoặc mật khẩu!", "error"));
    });

    // Xoá tài khoản
    $('#btn-delete-account').click(async () => 
    {
        const user = auth.currentUser; // Lấy thông tin khách đang đăng nhập

        if (user) 
        {
            const xacNhan = confirm("Bạn có chắc là xoá tài khoản không? (Không thể phục hồi)");
        
            if (xacNhan) 
            {
                try 
                {
                    // Bước 1: xoá data trong firestore 
                    await deleteDoc(doc(db, "TaiKhoan", user.uid));
                    
                    // Bước 2: xoá tài khoản trong phòng nhân sự (Auth)
                    await deleteUser(user);
                    hienThongBao("Đã xoá tài khoản thành công!", "success");
                    setTimeout(() => 
                    {
                        window.location.href = "index.html"; 
                    }, 3500);
                
                } 
                catch (error) 
                {
                    // Do firebase không cho xoá tài khoản nếu đã đăng nhập quá lâu -> đăng xuất và đăng nhập lại
                    if (error.code === 'auth/requires-recent-login') 
                    {
                        hienThongBao("Bạn đã đăng nhập quá lâu rồi, hãy đăng xuất và đăng nhập lại để xoá tài khoản nhé!", "error");
                    } 
                    else 
                    {
                        hienThongBao("Lỗi không xóa được: " + error.message, "error");
                    }
                }
            }
        } 
        else 
        {
            hienThongBao("Bạn vẫn chưa đăng nhập nên chưa thể xoá tài khoản", "error");
        }
    });

    $('#btn-signout').click(function() 
    {
    signOut(auth)
        .then(() => 
        {
            // Khúc này là kịch bản tốt: Đăng xuất thành công
            hienThongBao("Đã đăng xuất!", "success");
            window.location.reload(); // F5 tải lại trang cho nó xóa sạch thông tin cũ
        })
        .catch((error) => 
        {
            // Khúc này xui xẻo bị lỗi (rất hiếm khi xảy ra)
            hienThongBao("Lỗi không đăng xuất được: " + error.message, "error");
        });
    });
});

$('#login-password').keypress(function(event) {
    // Kiểm tra xem phím vừa gõ có phải là phím Enter (mã 13) không
    if (event.keyCode === 13 || event.which === 13) {
        event.preventDefault(); // Chặn hành vi mặc định (đề phòng form tự submit làm load lại trang)
        $('#login-button').click(); // Ra lệnh cho máy tự click vào nút Đăng nhập luôn 🖱️✨
    }
});