// Script xuất báo cáo ra file Word (.docx) - Tiếng Việt
const fs = require('fs')
const path = require('path')
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
} = require('docx')

// Hàm helper
const p = (text, options = {}) =>
  new Paragraph({
    spacing: { after: 120 },
    alignment: options.align || AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        bold: options.bold || false,
        italics: options.italics || false,
        size: options.size || 22, // 11pt
        color: options.color || '000000',
        font: 'Times New Roman',
      }),
    ],
  })

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 200 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32,
        color: '1F4788',
        font: 'Times New Roman',
      }),
    ],
  })

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
        color: '2E5C8A',
        font: 'Times New Roman',
      }),
    ],
  })

const h3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: '4A7BA8',
        font: 'Times New Roman',
      }),
    ],
  })

const bullet = (text) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, font: 'Times New Roman' })],
  })

const codeBlock = (text) =>
  new Paragraph({
    spacing: { after: 120 },
    indent: { left: 360 },
    children: [
      new TextRun({
        text,
        font: 'Consolas',
        size: 20,
        color: 'C7254E',
      }),
    ],
  })

const createTable = (headers, rows) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
      left: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
      right: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        shading: { fill: '1F4788', type: ShadingType.CLEAR, color: 'auto' },
        children: headers.map(
          (h) =>
            new TableCell({
              width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 22, font: 'Times New Roman' }),
                  ],
                }),
              ],
            })
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, size: 22, font: 'Times New Roman' })],
                    }),
                  ],
                })
            ),
          })
      ),
    ],
  })

// === NỘI DUNG BÁO CÁO ===
const children = [
  // Tiêu đề
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: 'BÁO CÁO TỔNG HỢP THAY ĐỔI DỰ ÁN',
        bold: true,
        size: 40,
        color: '1F4788',
        font: 'Times New Roman',
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: 'WEBXEMPHIM',
        bold: true,
        size: 36,
        color: 'C7254E',
        font: 'Times New Roman',
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [
      new TextRun({
        text: 'Phiên bản: 1.0  |  Ngày: 20/07/2026',
        italics: true,
        size: 22,
        font: 'Times New Roman',
      }),
    ],
  }),

  // Mục 1
  h1('1. TỔNG QUAN DỰ ÁN'),
  p(
    'WebXemPhim là nền tảng xem phim trực tuyến được phát triển với kiến trúc full-stack, bao gồm Backend (Node.js + Express.js) và Frontend (React + Vite). Dự án cung cấp các tính năng quản lý phim, xác thực người dùng với OTP, upload file đa phương tiện và phát video trực tuyến.'
  ),
  p('Thông tin dự án:', { bold: true }),
  bullet('Tên dự án: WebXemPhim'),
  bullet('Workspace: d:\\VisualCode\\DoAn3.1'),
  bullet('Branch: master'),
  bullet('Commit gần nhất: 276b3f3 - feat: add admin upload page and movie upload functionality'),
  bullet('Repository: Git'),

  // Mục 2
  h1('2. LỊCH SỬ COMMIT'),
  p('Dự án đã có 10 commits với các milestone quan trọng sau:', { bold: true }),

  h2('2.1. Commit khởi tạo (5b1b224)'),
  p('Initial commit - Khởi tạo dự án với cấu trúc ban đầu, thiết lập thư mục backend và frontend.'),

  h2('2.2. Tích hợp Email & OTP (4e3c1df)'),
  bullet('Tích hợp nodemailer để gửi email'),
  bullet('Tạo chức năng sinh mã OTP ngẫu nhiên'),
  bullet('Cấu hình SMTP credentials'),

  h2('2.3. OTP Endpoints (7e140e0)'),
  bullet('Thêm endpoint POST /api/auth/send-otp'),
  bullet('Thêm endpoint POST /api/auth/verify-otp'),
  bullet('Cập nhật OTP model với schema validation'),
  bullet('Nâng cấp memoryStore hỗ trợ OTP CRUD'),

  h2('2.4. Refactor Authentication (d9a9c51)'),
  bullet('Xử lý lại request body parsing trong authController'),
  bullet('Tăng cường error middleware cho JSON parsing'),
  bullet('Cải thiện validation input'),

  h2('2.5. User Registration (2a0a82d)'),
  p(
    'Triển khai luồng đăng ký người dùng hoàn chỉnh với xác thực OTP qua email, bao gồm các bước: nhập email, nhận OTP, xác minh, hoàn tất đăng ký.'
  ),

  h2('2.6. Frontend Shell (8825fb8)'),
  bullet('Khởi tạo React app với Vite'),
  bullet('Thiết lập routing với React Router'),
  bullet('Tạo cấu trúc trang Login/Register'),
  bullet('Cấu hình TailwindCSS hoặc CSS modules'),

  h2('2.7. Package Management (ec79c03)'),
  bullet('Thêm backend/package.json'),
  bullet('Thêm backend/package-lock.json'),
  bullet('Thêm frontend/package.json'),
  bullet('Quản lý dependencies tập trung'),

  h2('2.8. Health Check (6367c60)'),
  bullet('Endpoint GET / trả về API status'),
  bullet('Endpoint GET /api/health kiểm tra trạng thái server'),
  bullet('Trả về thông tin database connection'),

  h2('2.9. Frontend-Backend Integration (e546cdb)'),
  bullet('Cấu hình API client'),
  bullet('Health check và static file serving'),
  bullet('Kết nối frontend với backend API'),
  bullet('Xử lý CORS đúng chuẩn'),

  h2('2.10. Email Credentials Sanitize (14e9e73)'),
  bullet('Làm sạch email credentials bằng trim'),
  bullet('Loại bỏ khoảng trắng thừa'),
  bullet('Đảm bảo EMAIL_USER và EMAIL_PASS đúng định dạng'),

  h2('2.11. Admin Upload & Movie Upload (276b3f3) - COMMIT LỚN NHẤT'),
  p('Thống kê:', { bold: true }),
  bullet('37 files changed'),
  bullet('5636 insertions'),
  bullet('1189 deletions'),
  bullet('Tạo mới nhiều components và endpoints'),

  // Mục 3
  h1('3. THAY ĐỔI BACKEND (CHƯA COMMIT)'),
  p('Các file backend hiện đang có thay đổi chưa được commit vào Git:', { bold: true }),

  h2('3.1. Files đã sửa đổi'),
  createTable(
    ['STT', 'File', 'Thay đổi'],
    [
      ['1', 'backend/src/app.js', '+27 dòng - Static file serving với Range support'],
      ['2', 'backend/package.json', '-1 dòng (loại bỏ cloudinary)'],
      ['3', 'backend/src/controllers/authController.js', 'Tinh chỉnh logic xác thực'],
      ['4', 'backend/src/controllers/movieController.js', '+34 dòng'],
      ['5', 'backend/src/controllers/uploadController.js', '+19 dòng'],
      ['6', 'backend/src/middleware/adminMiddleware.js', 'Điều chỉnh quyền admin'],
      ['7', 'backend/src/middleware/authMiddleware.js', 'Điều chỉnh JWT verification'],
      ['8', 'backend/src/routes/authRoutes.js', 'Điều chỉnh routes'],
    ]
  ),

  h2('3.2. Files đã xóa'),
  bullet('backend/src/config/cloudinary.js - Loại bỏ cấu hình Cloudinary'),
  bullet('backend/src/services/cloudinaryService.js - Loại bỏ service Cloudinary'),

  h2('3.3. Files mới tạo'),
  h3('localStorageService.js'),
  p(
    'Service thay thế Cloudinary, lưu trữ file trực tiếp trên disk local. Tự động tạo thư mục uploads/{videos,posters,thumbnails} và cung cấp các hàm:'
  ),
  bullet('saveFile(buffer, subDir, filename) - Promise-based file writer'),
  bullet('removeFile(url) - Xóa file theo URL'),
  bullet('localUploadVideo(buffer, options) - Upload video MP4'),
  bullet('localUploadPoster(buffer, options) - Upload poster JPG'),
  bullet('localUploadThumbnail(buffer, options) - Upload thumbnail JPG'),
  bullet('localDestroy(publicId, resourceType) - Xóa file theo ID'),

  p('Cấu hình Express static:', { bold: true }),
  codeBlock("app.use('/uploads', express.static(uploadsDir, OPTIONS))"),
  p('Hỗ trợ Range requests cho video streaming với Content-Type phù hợp.', { italics: true }),

  // Mục 4
  h1('4. THAY ĐỔI FRONTEND (CHƯA COMMIT)'),
  p('Thống kê: 14 files changed, 2682 insertions(+), 628 deletions(-)', { bold: true }),

  h2('4.1. Files đã sửa đổi'),
  createTable(
    ['STT', 'File', 'Dòng thay đổi', 'Mô tả'],
    [
      ['1', 'App.css', '+1614', 'CSS mới toàn bộ'],
      ['2', 'AdminUpload.jsx', '+1241', 'Refactor lớn trang upload'],
      ['3', 'Profile.jsx', '-264', 'Rút gọn và tối ưu'],
      ['4', 'Movies.jsx', '+44', 'Thêm bộ lọc và phân trang'],
      ['5', 'MovieDetail.jsx', '+29', 'Cải thiện UI chi tiết'],
      ['6', 'MovieContext.jsx', '+45', 'Mở rộng state management'],
      ['7', 'VideoPlayer.jsx', '+16', 'Tùy chỉnh player controls'],
      ['8', 'MovieCard.jsx', '+7', 'Cải thiện card layout'],
      ['9', 'HeroBanner.jsx', '+12', 'Thêm animations'],
      ['10', 'api.js', '+10', 'Helper resolveMediaUrl'],
      ['11', 'helpers.js', '+7', 'Utility functions'],
      ['12', 'App.jsx', '+13', 'Routing updates'],
      ['13', 'AdminLayout.jsx', '+2', 'Layout tinh chỉnh'],
      ['14', 'vite.config.ts', '+6', 'Cấu hình proxy'],
    ]
  ),

  h2('4.2. Files mới tạo'),
  h3('movieStorage.js'),
  p('Quản lý localStorage cho danh sách phim:', { bold: true }),
  bullet('MOVIE_STORAGE_KEY = cineflow_movies'),
  bullet('loadMovies(fallback) - Load danh sách phim từ localStorage'),
  bullet('saveMovies(movies) - Lưu danh sách phim vào localStorage'),
  bullet('Hỗ trợ SSR-safe với kiểm tra typeof localStorage'),

  h3('movieContent.js'),
  p('Utility xử lý các content types:', { bold: true }),
  bullet('5 loại nội dung: movie, series, tv_show, anime, documentary'),
  bullet('getMovieType(movie) - Lấy type hợp lệ'),
  bullet('getContentTypeOption(type) - Lấy option theo type'),
  bullet('isEpisodicContent(movie) - Kiểm tra có nhiều tập'),
  bullet('getContentStats(movie) - Thống kê số mùa/tập'),
  bullet('getContentSummary(movie) - Tóm tắt nội dung'),
  bullet('createContentId(prefix) - Tạo ID ngẫu nhiên'),

  h3('ContentTypePills.jsx'),
  p('Component pills lọc theo loại nội dung, sử dụng CONTENT_TYPE_OPTIONS từ movieContent.'),

  h3('SeasonEpisodeEditor.jsx'),
  p('Editor cho phép admin quản lý seasons và episodes của series/TV show/anime.'),

  // Mục 5
  h1('5. TÍNH NĂNG ĐÃ TRIỂN KHAI'),

  h2('5.1. Backend Features'),
  bullet('Authentication System: Đăng ký/Đăng nhập với OTP qua email'),
  bullet('Movie Management API: CRUD operations cho phim'),
  bullet('File Upload: Video, Poster, Thumbnail (Local Storage)'),
  bullet('Video Streaming: Hỗ trợ HTTP Range requests'),
  bullet('Static Files: Serve frontend build từ Express'),
  bullet('Rate Limiting: Middleware giới hạn upload requests'),
  bullet('CORS: Cấu hình cho phép frontend cross-origin'),

  h2('5.2. Frontend Features'),
  bullet('Admin Upload Page: Form upload phim với metadata đầy đủ'),
  bullet('5 Content Types: movie, series, tv_show, anime, documentary'),
  bullet('Quality Options: 4K, FHD, HD, SD'),
  bullet('Episode/Season Editor: Cho series và TV shows'),
  bullet('Movie Context: State management toàn cục với React Context'),
  bullet('Custom Video Player: Player với controls tùy chỉnh'),
  bullet('Movie Cards & Hero Banner: UI components hiển thị danh sách'),
  bullet('User Pages: Profile, Movies, MovieDetail'),
  bullet('LocalStorage Persistence: Lưu trữ offline'),

  // Mục 6
  h1('6. CÔNG NGHỆ SỬ DỤNG'),

  h2('6.1. Backend Stack'),
  createTable(
    ['Công nghệ', 'Mục đích'],
    [
      ['Express.js', 'Web framework chính'],
      ['MongoDB / MemoryStore', 'Database (chuyển đổi linh hoạt)'],
      ['JWT', 'Xác thực token-based'],
      ['Nodemailer', 'Gửi email OTP'],
      ['Multer', 'Xử lý multipart/form-data upload'],
      ['dotenv', 'Quản lý environment variables'],
      ['CORS', 'Cross-Origin Resource Sharing'],
      ['bcrypt', 'Hash mật khẩu'],
    ]
  ),

  h2('6.2. Frontend Stack'),
  createTable(
    ['Công nghệ', 'Mục đích'],
    [
      ['React', 'UI library chính'],
      ['Vite', 'Build tool và dev server'],
      ['React Router', 'Routing SPA'],
      ['Lucide React', 'Icon library'],
      ['Sonner', 'Toast notifications'],
      ['localStorage', 'Client-side persistence'],
      ['CSS Modules', 'Styling'],
    ]
  ),

  // Mục 7
  h1('7. HƯỚNG PHÁT TRIỂN TIẾP THEO'),
  p('Các công việc cần thực hiện:', { bold: true }),
  bullet('Commit các thay đổi hiện tại vào Git với message có ý nghĩa'),
  bullet('Viết unit test cho backend controllers'),
  bullet('Viết integration test cho upload flow'),
  bullet('Tối ưu performance cho video streaming'),
  bullet('Thêm pagination cho danh sách phim'),
  bullet('Implement search functionality'),
  bullet('Thêm comments/reviews cho phim'),
  bullet('Xây dựng hệ thống recommendations'),
  bullet('CI/CD pipeline với GitHub Actions'),

  // Lời kết
  h1('8. KẾT LUẬN'),
  p(
    'Dự án WebXemPhim đã đạt được những tiến bộ đáng kể trong việc xây dựng một nền tảng xem phim trực tuyến hoàn chỉnh. Các tính năng cốt lõi đã được triển khai bao gồm xác thực người dùng với OTP, quản lý phim, upload file đa phương tiện và phát video. Việc chuyển đổi từ Cloudinary sang Local Storage giúp đơn giản hóa deployment và giảm chi phí vận hành.'
  ),
  p(
    'Hiện tại có nhiều thay đổi chưa được commit vào Git. Đề xuất commit sớm để đảm bảo an toàn dữ liệu và duy trì lịch sử phiên bản rõ ràng.'
  ),

  new Paragraph({ children: [new PageBreak()] }),

  // Trang cuối
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [
      new TextRun({
        text: '-- HẾT --',
        bold: true,
        size: 28,
        color: '888888',
        font: 'Times New Roman',
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: 'Báo cáo được tạo tự động bởi Cursor Assistant',
        italics: true,
        size: 20,
        color: '666666',
        font: 'Times New Roman',
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: 'Ngày 20/07/2026',
        italics: true,
        size: 20,
        color: '666666',
        font: 'Times New Roman',
      }),
    ],
  }),
]

// Tạo document
const doc = new Document({
  creator: 'Cursor Assistant',
  title: 'Báo cáo tổng hợp thay đổi dự án WebXemPhim',
  description: 'Báo cáo chi tiết các thay đổi trong dự án',
  styles: {
    default: {
      document: {
        run: { font: 'Times New Roman', size: 22 },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1000,
            right: 1000,
            bottom: 1000,
            left: 1000,
          },
        },
      },
      children,
    },
  ],
})

// Xuất file
const outputPath = path.join(__dirname, 'BaoCao_WebXemPhim_20-07-2026.docx')
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer)
  console.log('========================================')
  console.log('XUẤT FILE WORD THÀNH CÔNG!')
  console.log('========================================')
  console.log('Đường dẫn:', outputPath)
  console.log('Kích thước:', (buffer.length / 1024).toFixed(2), 'KB')
  console.log('Số trang ước tính: ~6-8 trang')
}).catch((err) => {
  console.error('LỖI khi tạo file:', err)
  process.exit(1)
})
