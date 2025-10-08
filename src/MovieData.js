const movies = [
    {
        id: 1,
        title: "Doraemon: Nobita và Cuộc Phiêu Lưu Vào Thế Giới Trong Tranh",
        image: "https://upload.wikimedia.org/wikipedia/vi/5/5d/Doraemon_Movie_2025_Poster.jpg",
        trailer: "https://www.youtube.com/embed/nDR_9NCMIYk",
        duration: "105 phút",
        releaseDate: "23/05/2025",
        rating: "P",
        country: "Nhật Bản",
        studio: "Shin-Ei Animation",
        director: "Yukiyo Teramoto",
        genre: ["Hoạt Hình", "Phiêu Lưu", "Gia Đình"],
        cast: ["Nobita", "Doraemon", "Shizuka", "Jaian", "Suneo"],
        description: `Trong phần phim này, Doraemon và nhóm bạn của Nobita sử dụng bảo bối "Cửa tranh" để bước vào thế giới hội họa. 
        Họ đến vương quốc Artoria, nơi lưu giữ những bức tranh quý giá. Tại đây, họ phải đối mặt với thử thách để cứu lấy những sắc màu tạo nên vẻ đẹp của thế giới. Phim mang đến thông điệp về tình bạn, sự đoàn kết và sức mạnh của nghệ thuật.`,
        showtimes: [
            { date: "Thứ 2 (06/10)", subtitle: ["13:00", "16:30"], dub: ["19:00", "21:00"] },
            { date: "Thứ 3 (07/10)", subtitle: ["10:30", "14:00"], dub: ["17:30", "20:00"] },
            { date: "Thứ 4 (08/10)", subtitle: ["09:30", "13:15", "15:45"], dub: ["18:00", "20:30"] },
            { date: "Thứ 5 (09/10)", subtitle: ["10:00", "12:30", "15:30"], dub: ["18:30", "21:15"] },
            { date: "Thứ 6 (10/10)", subtitle: ["09:45", "13:45", "16:15"], dub: ["18:45", "21:30", "23:00"] },
            { date: "Thứ 7 (11/10)", subtitle: ["08:30", "11:00", "13:30", "16:00"], dub: ["18:30", "21:00", "23:30"] },
            { date: "Chủ nhật (12/10)", subtitle: ["09:00", "11:30", "14:00", "16:30"], dub: ["19:00", "21:30"] }
        ]
    },
    {
        id: 2,
        title: "Your Name (Kimi no Na wa)",
        image: "https://upload.wikimedia.org/wikipedia/vi/0/01/Poster_Your_Name_H%C3%A0n_Qu%E1%BB%91c_ch%C3%A0o_m%E1%BB%ABng_3_tri%E1%BB%87u_l%C6%B0%E1%BB%A3t_xem.jpg",
        trailer: "https://www.youtube.com/embed/xU47nhruN-Q",
        duration: "112 phút",
        releaseDate: "26/08/2016",
        rating: "PG-13",
        country: "Nhật Bản",
        studio: "CoMix Wave Films",
        director: "Makoto Shinkai",
        genre: ["Hoạt Hình", "Tình Cảm", "Kỳ Ảo"],
        cast: ["Taki Tachibana", "Mitsuha Miyamizu"],
        description: `Your Name kể câu chuyện về Taki và Mitsuha – hai học sinh xa lạ ở Nhật Bản nhưng lại bí ẩn hoán đổi thân xác cho nhau. 
        Họ dần khám phá sự liên kết kỳ lạ, vượt qua thời gian và không gian, để tìm thấy nhau. Bộ phim kết hợp tình cảm lãng mạn, yếu tố siêu nhiên và hình ảnh tuyệt đẹp, trở thành hiện tượng toàn cầu.`,
        showtimes: [
            { date: "Thứ 2 (06/10)", subtitle: ["13:00", "16:00"], dub: ["19:00"] },
            { date: "Thứ 3 (07/10)", subtitle: ["10:00", "14:30"], dub: ["18:00", "21:00"] },
            { date: "Thứ 4 (08/10)", subtitle: ["09:45", "13:15", "15:45"], dub: ["18:15", "20:45"] },
            { date: "Thứ 5 (09/10)", subtitle: ["10:15", "13:30"], dub: ["17:45", "20:15", "22:30"] },
            { date: "Thứ 6 (10/10)", subtitle: ["09:30", "12:00", "14:30"], dub: ["18:00", "20:30", "23:00"] },
            { date: "Thứ 7 (11/10)", subtitle: ["08:30", "11:00", "13:30"], dub: ["16:00", "19:00", "21:30", "23:30"] },
            { date: "Chủ nhật (12/10)", subtitle: ["09:00", "11:30", "14:00", "16:30"], dub: ["19:00", "21:30"] }
        ]
    },
    {
        id: 3,
        title: "Tarot",
        image: "https://preview.redd.it/poster-for-tarot-v0-ea41mzzc3lfc1.jpeg?width=640&crop=smart&auto=webp&s=8e1b1ae7d46fb15e430cf84f4bb319de9420b3e1",
        trailer: "https://www.youtube.com/embed/mqiEnk8Lrco",
        duration: "100 phút",
        releaseDate: "15/05/2024",
        rating: "R",
        country: "Mỹ",
        studio: "Screen Gems",
        director: "Spencer Cohen & Anna Halberg",
        genre: ["Kinh Dị", "Giật Gân"],
        cast: ["Harriet Slater", "Adain Bradley", "Jacob Batalon"],
        description: `Tarot là một bộ phim kinh dị siêu nhiên kể về một nhóm bạn trẻ sử dụng bộ bài Tarot cổ bị nguyền rủa, dẫn đến việc bị thực thể bí ẩn săn đuổi theo số phận của các lá bài. 
        Phim khai thác nỗi sợ hãi về định mệnh và lựa chọn con người.`,
        showtimes: [
            { date: "Thứ 2 (06/10)", subtitle: ["15:00", "17:30"], dub: ["20:00"] },
            { date: "Thứ 3 (07/10)", subtitle: ["13:30", "16:00"], dub: ["19:30", "22:00"] },
            { date: "Thứ 4 (08/10)", subtitle: ["12:00", "14:30", "17:00"], dub: ["19:30", "22:15"] },
            { date: "Thứ 5 (09/10)", subtitle: ["11:45", "14:00", "16:15"], dub: ["18:30", "21:00", "23:15"] },
            { date: "Thứ 6 (10/10)", subtitle: ["10:30", "13:00", "15:30"], dub: ["18:00", "20:30", "23:00"] },
            { date: "Thứ 7 (11/10)", subtitle: ["09:30", "12:00", "14:30", "17:00"], dub: ["19:30", "22:00", "23:59"] },
            { date: "Chủ nhật (12/10)", subtitle: ["10:00", "12:30", "15:00"], dub: ["18:00", "20:30"] }
        ]
    }
];

export default movies;
