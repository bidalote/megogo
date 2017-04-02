var debug = false,//window.location="http://freetv.infomir.com.ua/inet-services/public_html/";
        video_quality_for_saving='',
        lang, // переменная выбора языка при запросах на сервер
        video_quality_list=['auto','1080','720','576','480','360','320','240'],
        video_resolutions_list=['', '1920x1080','1280x720','1024x576','832x468','640x360','576x324','448x252'],
        video_description_data = {
            "":'',
            "1080p":'1920x1080',
            "720p":'1280x720',
            "576p":'1024x576',
            "480p":'832x468',
            "360p":'640x360', 
            "320p":'576x324',
            "240p":'448x252'
        },
        current_video_quality='',
	sort ='year',
        request_attempt=[],
	genreList =[],
        genre_list_length, // length of the genre list from the server for some category
	back_location = decodeURIComponent(window.location.search.match(/\?referrer\=.*/)),
	flFavorUpdate=0,
	flSubCatTurn =0,
	runFl = true,
	playlist = [],
	playTime = 0,
	childFree = 0,
	favorites = [],
	megogoURL =  'http://megogo.net/',
    iviURL =  'http://megogo.net/p/',
    win = {"width":screen.width,"height":screen.height},

    video_files_total_num=0, // количество фильмов в категории/жанре
//    temporary_total_num=0, // временнная переменная замещающая глючное значение количества ответов получаемое от сервера при поиске
    main_video_files_list=[], // основной массив содержащий инф о  фильмах при перемещении по каталогам
    current_film_id='', // id текущего фильма
    videofiles_continue_array=[{'id':0,'time_pos':0}], // массив значений для продолжения проигрывания для всех фильмов
    continue_reset_flag=true, // флаг одинарного запуска проверки и выставления продолжения проигрывания при открытии видео
    connection_for_playlist_try=0, // попытка связаться с сервером для получения плейлиста. используется при разрыве связи 
    searchResultLst_reset_flag=false, // флаг для запуска вычисления длины, количества страниц и прочего при входе в каталог
    loading_status='loaded', // флаг особого расположения главного меню при первом входе в программу
    continue_video_from_pos='', // продожить играть видео при разрыве с указанного момента
    session = '', // значение сессии
    step_for_infomenu_scrolling=50, // шаг при прокрутке экрана отзывов и актеров
    extCatLst_reset_flag=true, //  флаг для запуска вычисления длины, количества страниц и прочего при входе в каталог
    pages = new Array(), // is it work?
    sugg = 0, // suggests
    loading_read_retry_number=0, // номер попытки чтения данных из массива в случае когда ajax ответ с данными запаздывает
    this_is_news_cat=false, // у новостей особый дизайн по сравнению с др. категоориями, потому нужен флаг для выделения
    
    // трех с половинное меню
    vertical_cat_buffer='', //buffer for resieved films from server
    subCatLst_reset_flag=true, //  флаг для запуска вычисления длины, количества страниц и прочего при входе в каталог
    vcat_num_of_pages=0,
    
    layers = ['login_page','cats_page','subcats_page','modal_search1','content_page','player_page','genre_page','info_page'/*, 'menu_series'*/],
    layer_auth = 0,
    layer_cats = 1,
    layer_subcats = 2,
    layer_search = 3,
    layer_content = 4,
    layer_player = 5,
    layer_genre = 6,
    layer_info = 7,
    PREV_LAYER = 0,
    CUR_LAYER = 1,

    sub_layers = ['pop_layer','video_layer'],
    sub_layer_pop = 0,
    sub_layer_video = 1,
    SUB_CUR_LAYER = 1,
    left_side = true,
    alt_left_side = true,
    pop_layer = true,
    layer_indexes = {
        "active":[
            {'login_form':0},0,0,0,0,0,0
        ],
        "array":[
            {'login_form':['login','password','submit','login_ok','login_cancel']},
            [],
            [],
            {'search_form':['search_line','search_cats','search_country','search_ok','search_cancel']},
            [],
            [],
            [{'genre_len':0}]
        ]
    },

    autologin = false,
    promo_obj = [],
    cats_obj = [],
    dataset = [],
    seasons,
    search_obj = [],
    subcatsArr = [],
    newAlert_on = false,
    //catsSelector = {"step":[0,0,234,0],position:[0,0,166,0]},
    suggest_active = false,
    suggest_count = 0,
    suggest_focus = -1,
    file,
    vars={
        "catSel":0,
        "curCatSel":0,
        "catsArr":[
                    {"id":"cat_0","normal":"menu","focus":"menu_focus","click":"menu_act","func":"req"},
                    {"id":"cat_1","normal":"menu","focus":"menu_focus","click":"menu_act","func":"req"},
                    {"id":"cat_2","normal":"menu","focus":"menu_focus","click":"menu_act","func":"req"},
                    {"id":"cat_3","normal":"menu","focus":"menu_focus","click":"menu_act","func":"req"},
                    {"id":"cat_4","normal":"menu","focus":"menu_focus","click":"menu_act","func":"req"},
                    {"id":"cat_5","normal":"menu","focus":"menu_focus","click":"menu_act","func":"req"},
                    {"id":"cat_6","normal":"menu","focus":"menu_focus","click":"menu_act","func":"req"}],
//      "catID":[0,16,4,6,9, -1/*,17*/],
        "catID":[0],
        "cats":[
            [{"id":null,"title":''},{"id":null,"title":''},{"year_from":null,"year_to":null}],
            [{"id":null,"title":''},{"id":null,"title":''},{"year_from":null,"year_to":null}],
            [{"id":null,"title":''},{"id":null,"title":''},{"year_from":null,"year_to":null}],
            [{"id":null,"title":''},{"id":null,"title":''},{"year_from":null,"year_to":null}]]
        ,
        "promo_page":0,
        "subcats_page":0,
        "subcats_item":0,
        "cont_page_x":0,
        "cont_page_y":0,
        "content_page":0,
        "player_vars":{
            "volume":0,
            "mute":0,
            "playback":0,
            "playlist":0,
            "roller_step":0,
            "isplaying":0,
            "pause":false,
            "aspect_current":0,
            "aspects":[
                {
                    "name":"fit",
                    "img":'img/aspect_fit.png',
                    "mode":0x10
                },
                {
                    "name":"big",
                    "img":'img/aspect_big.png',
                    "mode":0x40
                },
                {
                    "name":"opt",
                    "img":'img/aspect_opt.png',
                    "mode":0x50
                },
                {
                    "name":"exp",
                    "img":'img/aspect_exp.png',
                    "mode":0x00
                }
            ]
        },
        "player_shown":0,
        "file_curtime":0,
        "file_lenght":0,
        "file_percent":0,

        // переменные определяющие внешний вид и функционал при других разрешениях
        "480":{
            "subcats_onpage":11,
            "cont_page_x_max":1,
            "cont_page_y_max":3,
            "ext_cont_page_x_max":3,
            "poster_width":'75px',
            "poster_height":'95px',
            "infoposter_width":'160px',
            "infoposter_height":'220px',
            "promo_width":'',
            "promo_height":'',
            "stripe_len":560,
            "seriesLen":8,
            "seasonTextLen":14,
            "episodeTexLen":14,
            "rating_length":8
        },
        "576":{
            "subcats_onpage":11,
            "cont_page_x_max":1,
            "cont_page_y_max":3,
            "ext_cont_page_x_max":3,
            "poster_width":'90px',
            "poster_height":'120px',
            "infoposter_width":'140px',
            "infoposter_height":'220px',
            "promo_width":'',
            "promo_height":'',
            "stripe_len":560,
            "seriesLen":7,
            "seasonTextLen":14,
            "episodeTexLen":14,
            "rating_length":10
        },
        "720":{
            "subcats_onpage":11,
            "cont_page_x_max":1,
            "cont_page_y_max":3,
             "ext_cont_page_x_max":5,
            "poster_width":'110px',
            "poster_height":'160px',
            "infoposter_width":'270px',
            "infoposter_height":'370px',
            "promo_width":'',
            "promo_height":'',
            "stripe_len":1120,
            "seriesLen":9,
            "seasonTextLen":16,
            "episodeTexLen":16,
            "rating_length":10
        },
        "1080":{
            "subcats_onpage":11,
            "cont_page_x_max":1,
            "cont_page_y_max":3,
             "ext_cont_page_x_max":5,
            "poster_width":'165px',
            "poster_height":'240px',
            "infoposter_width":'300',
            "infoposter_height":'422',
            "promo_width":'',
            "promo_height":'',
            "stripe_len":1760,
            "seriesLen":9,
            "seasonTextLen":11,
            "episodeTexLen":11,
            "rating_length":10
        },


        "menu_items":[  "blue",
			"violet",
			"green",
			"orange",
			"red",
			"blue",
			"separator",
			"special",
			"settings"
        ]
    };

//Таймера
    var runner_timer = null,
        pos_timer = null,
        setpos_timer = null,
        set_volume = null;

// кнопки пульта
var keys = {
    "exit":   27,
    "ok":  13,
    "right":  39,
    "left": 37,
    "up": 38,
    "down": 40,
    //"menu": 122,
    "back": 8,
    "keyboard": 76,
    "red" :112,
    "green": 113,
    "yellow" :114,
    "blue" :115,
    // "service"  :120,
    "frame" :117,
    "vol_up": 107,
    "vol_down" :109,
    "stop": 83,
    "play_and_pause": 82,
    "mute": 192,
    "power": 85
    //  "empty_key":  76
}

var countries ={},
    aspectTimer = 0,  // переменная пропорции видеоизображения (кнопка FRAME)
    accpass ={
        'login':'', 
        'pass':''
};
    // массив названий цветов для подстановки в имена CSS классов, - реализация цветовой зависимости дизайна от категории расположения видео
    var colors = ["blue",
    "violet","green","orange",
    "red","blue","olive",
    "navy","pink","banana",
    
    "violet","green","orange",
    "red","blue","navy",
    "olive","pink","banana"         
    ];
    var main_menu_item_colors = [
    "menu_item_violet","menu_item_green","menu_item_orange",
    "menu_item_red", "menu_item_blue","menu_item_navy",
    "menu_item_olive","menu_item_pink","menu_item_banana",
    
    "menu_item_violet","menu_item_green","menu_item_orange",
    "menu_item_red", "menu_item_blue", "menu_item_navy",
    "menu_item_olive","menu_item_pink","menu_item_banana"  
    ];
