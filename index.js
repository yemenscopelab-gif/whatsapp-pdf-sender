const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors()); // لتسمح لمشروع Lovable بالاتصال بالـ API بدون مشاكل حظر

let sock;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    sock = makeWASocket({ auth: state, printQRInTerminal: true });
    sock.ev.on('creds.update', saveCreds);
}
connectToWhatsApp();

app.post("/send-pdf", async (req, res) => {
    const { phoneNumber, pdfUrl, fileName } = req.body;
    try {
        // تنسيق الرقم ليتوافق مع نظام واتساب
        const id = `${phoneNumber}@s.whatsapp.net`;
        
        await sock.sendMessage(id, { 
            document: { url: pdfUrl }, 
            mimetype: 'application/pdf', 
            fileName: fileName || 'document.pdf' 
        });
        res.status(200).json({ success: true, message: "تم إرسال الملف بنجاح!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
