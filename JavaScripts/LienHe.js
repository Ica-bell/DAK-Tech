import { db } from './firebase_config.js';
import { collection, addDoc, serverTimestamp } from 
"https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

$(document).ready(function() {
    
    $('.btn-accept').click(async function(e) {
        e.preventDefault();

        const ten = window.tenKhachHang;
        const email = $('#email-user').val();
        const sdt = $('#Phonenumber-user').val();
        const noidung = $('#ND-GopY').val();

        if (!email || !noidung) {
            window.hienThongBao("Điền thiếu thông tin!", "error");
            return;
        }

        let btn = $(this);
        let textCu = btn.text();
        btn.text("Đang gửi...").prop('disabled', true);

        try {
            await addDoc(collection(db, "DanhSachGopY"), {
                tenKhachHang: ten,
                emailKhach: email,
                soDienThoai: sdt,
                loiNhan: noidung,
                thoiGianGui: serverTimestamp()
            });

            let emailParams = {
                name_user: ten,
                email: email,
                phone: sdt,
                message: noidung
            };

            await emailjs.send("service_saln5ic", "template_i1zwj3b", emailParams);

            window.hienThongBao("Đã ghi nhận góp ý của bạn, chúng tôi sẽ cố gắng phản hồi lại bạn sớm nhất!", "success");
            $('#email-user, #Phonenumber-user, #ND-GopY').val('');

        } catch (error) {
            console.error("Lỗi cmnr: ", error);
            window.hienThongBao("Lỗi mạng!", "error");
        } finally {
            btn.text(textCu).prop('disabled', false);
        }
    });
});