export const formatViews = (views) => Number(views || 0).toLocaleString('vi-VN')

export const getUniqueGenres = (movies) => ['Tất cả', ...Array.from(new Set(movies.map((movie) => movie.genreName)))]

export const demoMovies = [
  {
    _id: 'm1',
    title: 'Neon Horizon',
    description: 'Một shipper băng qua siêu đô thị rực sáng để giao bí mật có thể khởi động lại tương lai.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    genreName: 'Sci-Fi',
    duration: 118,
    views: 12420,
    featured: true,
  },
  {
    _id: 'm2',
    title: 'Last Frame',
    description: 'Một nhiếp ảnh gia nghỉ hưu quay lại thành phố nơi bức ảnh dang dở từng thay đổi đời ông.',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    genreName: 'Drama',
    duration: 104,
    views: 8320,
    featured: true,
  },
  {
    _id: 'm3',
    title: 'Midnight Chase',
    description: 'Hai người xa lạ có một đêm để lật tẩy đường dây buôn lậu ẩn dưới bến cảng.',
    posterUrl: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    genreName: 'Action',
    duration: 126,
    views: 15480,
    featured: false,
  },
  {
    _id: 'm4',
    title: 'Quiet Signal',
    description: 'Một kỹ sư âm thanh nghe thấy tín hiệu cũ dẫn về vụ mất tích chưa từng được công bố.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    genreName: 'Mystery',
    duration: 99,
    views: 6750,
    featured: false,
  },
]

export const demoComments = [
  {
    _id: 'c1',
    movieId: 'm1',
    authorName: 'Linh',
    content: 'Hình ảnh đẹp, nhịp phim cuốn.',
    createdAt: new Date().toISOString(),
  },
]
