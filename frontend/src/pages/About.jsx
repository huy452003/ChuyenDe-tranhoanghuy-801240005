function About() {
  return (
    <div className="py-12">
      <div className="container-custom">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold mb-6">Về Chúng Tôi</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vest Shop - Nơi phong cách và đẳng cấp được tôn vinh
          </p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800"
              alt="About Us"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold mb-6">Câu Chuyện Của Chúng Tôi</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Được thành lập từ năm 2020, Vest Shop đã và đang khẳng định vị thế của mình
              trong ngành thời trang vest cao cấp tại Việt Nam. Với tâm huyết và đam mê
              với nghệ thuật may mặc, chúng tôi không ngừng mang đến những bộ vest hoàn hảo
              nhất cho quý khách hàng.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Mỗi bộ vest tại Vest Shop đều được chế tác tỉ mỉ từ những nghệ nhân lành nghề,
              sử dụng vải cao cấp nhập khẩu từ Italy và Anh Quốc. Chúng tôi tin rằng một bộ
              vest không chỉ là trang phục, mà còn là biểu tượng của sự tự tin và thành công.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="bg-gray-50 rounded-2xl p-12 mb-20">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">Giá Trị Cốt Lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-vest-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-vest-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold mb-3">Chất Lượng</h3>
              <p className="text-gray-600">
                Cam kết sử dụng chất liệu cao cấp nhất, đường may hoàn hảo trong từng chi tiết
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-vest-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-vest-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold mb-3">Tận Tâm</h3>
              <p className="text-gray-600">
                Đặt sự hài lòng của khách hàng lên hàng đầu với dịch vụ chăm sóc tận tình
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-vest-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-vest-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold mb-3">Sáng Tạo</h3>
              <p className="text-gray-600">
                Không ngừng đổi mới, kết hợp phong cách cổ điển và xu hướng hiện đại
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold mb-6">Đội Ngũ Của Chúng Tôi</h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Đội ngũ bảo vệ giàu kinh nghiệm, tâm huyết với nghề
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="card flex flex-col h-full">
              <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src="/image-kutin - Copy.png"
                  alt="Team member"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 flex-grow">
                <h3 className="font-serif font-bold text-lg">Huỳnh Nguyễn Ku Tin</h3>
                <p className="text-vest-gold text-sm">Bảo Vệ Chính - Tổ 1</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="card flex flex-col h-full">
              <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src="/Sun.jpg"
                  alt="Team member"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 flex-grow">
                <h3 className="font-serif font-bold text-lg">SunDy</h3>
                <p className="text-vest-gold text-sm">Bảo Vệ Phụ - Tổ 1</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card flex flex-col h-full">
              <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src="/KuKem.jpg"
                  alt="Team member"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 flex-grow">
                <h3 className="font-serif font-bold text-lg">Down Gia Thịnh</h3>
                <p className="text-vest-gold text-sm">Bảo Vệ Chính - Tổ 2</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="card flex flex-col h-full">
              <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src="/Mon.png"
                  alt="Team member"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 flex-grow">
                <h3 className="font-serif font-bold text-lg">Monny</h3>
                <p className="text-vest-gold text-sm">Bảo Vệ Phụ - Tổ 2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

