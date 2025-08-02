function Contact() {
  return (
    <section id="contact" className="py-12 bg-[#295230] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">ติดต่อเรา</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <i className="fas fa-phone-alt text-3xl mb-3"></i>
            <h3 className="text-xl font-semibold mb-1">โทรศัพท์</h3>
            <p>092 815 3097</p>
          </div>
          
          <div className="flex flex-col items-center">
            <i className="fas fa-map-marker-alt text-3xl mb-3"></i>
            <h3 className="text-xl font-semibold mb-1">ที่อยู่</h3>
            <p className="text-sm md:text-base">
              ศรีครินทร์ 96 หมู่ 4 ต.บ้านนา อำเภอ ศรีนครินทร์ พัทลุง 93000
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <i className="fas fa-envelope text-3xl mb-3"></i>
            <h3 className="text-xl font-semibold mb-1">อีเมล</h3>
            <p>raihinpooframstay@gmail.com</p>
          </div>
        </div>
        
        {/* Social Media */}
        <div className="flex justify-center gap-6 mt-8">
          <a href="https://www.facebook.com/Raihinpoofarmstay" target="_blank" className="text-2xl hover:text-yellow-400 transition-colors">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="#" className="text-2xl hover:text-yellow-400 transition-colors">
            <i className="fab fa-line"></i>
          </a>
          <a href="#" className="text-2xl hover:text-yellow-400 transition-colors">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contact;
