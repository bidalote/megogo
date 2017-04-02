/////////////////////// parent_lists_prototype ////////////////////////////////
parent_lists_prototype =   function ( handle ){
    this.pos=0;
    this.prevPos=0;
    this.handle = handle;
}
parent_lists_prototype.prototype.length=0;
parent_lists_prototype.prototype.page=0;
parent_lists_prototype.prototype.prevLst=0;
parent_lists_prototype.prototype.id=0;
parent_lists_prototype.prototype.direct='';
parent_lists_prototype.prototype.refreshPage = function(){}
parent_lists_prototype.prototype.next = function(){
    this.prevPos = this.pos;
    this.direct = 'next';
    if(this.pos < this.length-1)
    {
        this.pos++;
    }
    else{
        this.page++;
        this.pos = 0;
        this.overflow();
    }
    this.onChange();
}


parent_lists_prototype.prototype.prev = function(){
    this.direct = 'prev';
    this.prevPos = this.pos;
    if(this.pos){
        this.pos--;
    }
    else{
        if(this.length){
            this.pos = this.length-1;
        }
        this.page--;
        this.overflow();
    }
    this.onChange();
}


parent_lists_prototype.prototype.reset = function(){
    this.prevPos = this.pos;
    this.page = 0;
    this.pos = 0;
    this.onChange();
}


parent_lists_prototype.prototype.overflow = function(){}
parent_lists_prototype.prototype.onChange = function(){}
parent_lists_prototype.prototype.onEnter = function(){
    this.onChange();
}
/////////////////////   parent_lists_prototype  END   /////////////////

/////////////////////   catLst prototype      //////////////////
catLst = new parent_lists_prototype();
var	currLst = catLst,
prevLst = catLst;
catLst.length = 5;
catLst.id = 7;
catLst.initialisated = -1;
catLst.name = 'catLst';

var timeoutID = 0;
var fl_timeoutID = 0;


catLst.onRight = function(){
    this.onEnter();
}


catLst.next = function(){ //down button action for main menu
    this.prevPos = this.pos;
    this.direct = 'next';
    if(this.pos < (this.length-1)){
        this.pos++;
        echo("new pos++ = "+this.pos);
        if(this.pos!=(this.length-2) && this.pos!=(this.length-1) && $("cat_"+(this.pos+1)).style.display == "none"){
            $("cat_"+(this.pos+1)).style.display = "block";
            $("cat_"+(this.pos-4)).style.display = "none";  
        }
    }
    else{
        this.pos = 0;
        echo("this pos is 0 = "+this.pos);
        for(var n = 0; n<(this.length-2);n++ ){
            if(n<=4)$("cat_"+n).style.display = "block";
            if(n>4) $("cat_"+n).style.display = "none";
        }
    }
    this.onChange();
}


catLst.prev = function(){ //up button action for main menu
    this.direct = 'prev';
    this.prevPos = this.pos;
    if(this.pos){
        this.pos--;
        echo("new pos-- = "+this.pos);
        if(this.pos!=0  && $("cat_"+(this.pos-1)).style.display == "none"){
            $("cat_"+(this.pos-1)).style.display = "block";
            $("cat_"+(this.pos+4)).style.display = "none";  
        }
    }
    else{
        this.pos = this.length-1;
        echo("this pos is this.length-1 = "+(this.length-1));
        for(var n = 0; n<(this.length-2);n++ ){
            if(n<(this.length-7))$("cat_"+n).style.display = "none";
            if(n>=(this.length-7)) $("cat_"+n).style.display = "block";
        }
    }
    
    this.onChange(); // making next menu item active
}


catLst.onUp = function(){
    $('submenu_genres').style.display = 'none';
    $('submenu').style.display = 'none';
    currLst.prev();
}


catLst.onDown = function(){
    $('submenu_genres').style.display = 'none';
    $('submenu').style.display = 'none';
    currLst.next();
}


catLst.onChange = function(){
    if($('cat_'+this.prevPos)!=undefined)
        $('cat_'+this.prevPos).className = str_replace($('cat_'+this.prevPos).className, '_act', '');
    $('cat_'+this.pos).className = str_replace($('cat_'+this.pos).className, '_act', '');
    $('cat_'+this.pos).className = $('cat_'+this.pos).className+ '_act';
    if($('lang_footer_return').style.display=='block') $('lang_footer_return').style.display='none';
    subCatLst_reset_flag=true;
}

catLst.onExit = function(){
    echo('catLst.onExit');
    $('cats_page').style.display = 'none';
    $('confirmExit').style.display = 'block';
    prevLst = currLst;
    currLst = confirmExitLst;
    currLst.onChange();
}

catLst.onLeft = function(){}

catLst.onEnter = function(){
    echo('catLst.onEnter');
    
    if(this.pos==60000){        // подменю рекомендуемого кино
        subCatLst.prevPos = 0;
        subCatLst.page = 0;
        subCatLst.pos = 0;
        subCatLst_reset_flag=true;
        
        $('submenu_genres').style.display = 'none';
        sendreq(megogoURL+'p/recommend?'+createSign({
            'session':session,
            'limit':15,'lang':lang
        }), bufferForVerticalCat);
        // при первой загрузке приложения открытым должно быть первое меню
        if(loading_status=='first_loading'){ 
            loading_status='loaded';
            currLst = catLst;
            echo('subCatLst.pos='+subCatLst.pos);
        }else{  
            currLst = subCatLst;
            // переворачивание стрелки
            $('cat_'+catLst.pos).className = 'menu_item_blue_act_back';
        }
    } 
    
    if(this.pos>0 && this.pos<(catLst.length-3)){ // подменю всех жанров кроме избранного и рекомендуемого
        $('cat_'+this.pos).className = 'menu_item_'+colors[this.pos]+'_act_back';
        sendreq(megogoURL+'p/genres?'+createSign({
            'category': vars.catID[this.pos],
            'session':session,'lang':lang
        }), init_genreLst);
//        в init_genreLst так же находятся:
//        currLst = genreLst;
//        currLst.reset(); 
    }
    
    if(this.pos==(catLst.length-3)){  // при выборе избранного - выпадает это подменю
        if(!session){
            prevLst=catLst;
            currLst=modalLst;
            show_auth_request(lang_auth_request);
        }
        else {
            $('submenu_genres').style.display = 'none';
            var arr = $('video_layer');
            while(arr.children.length)
                {arr.removeChild(arr.children[0]);}
            sendreq(megogoURL+'p/favorites?'+createSign({
                'session':session,
                'limit':15,'lang':lang
            }), bufferForVerticalCat);
            currLst = subCatLst;
            $('cat_'+catLst.pos).className = 'menu_item_'+colors[catLst.pos]+'_act_back';
            this.initialisated = vars.catID[catLst.pos];
        }
    }
    
    if(this.pos==(catLst.length-2)){    // меню поиска
        CUR_LAYER=layer_search;
        currLst = searchLst;
        currLst.pos = 0;
        $("lang_footer_keyboard").style.display = "block";
        currLst.reset();
    }

    if(this.pos==(catLst.length-1)){
        $('cat_'+this.pos).className = 'menu_item_special_act_back';
        currLst = settingsSubmenuLst;
        echo('accpass.quality='+accpass.quality);
        currLst.pos = 0;
        currLst.reset();
    }    
}
/////////////////////// END catLst ////////////////////////////////////////////

///////////////////////////////   settingsSubmenuLst  /////////////////////////
settingsSubmenuLst = new parent_lists_prototype();
settingsSubmenuLst.length = 2;


settingsSubmenuLst.next = function(){
    this.prevPos = this.pos;
    this.direct = 'next';
    if(this.pos < this.length-1)
        this.pos++;
    this.onChange();
}


settingsSubmenuLst.prev = function(){
    this.direct = 'prev';
    this.prevPos = this.pos;
    if(this.pos)
        this.pos--;
    this.onChange();
}


settingsSubmenuLst.onChange = function(){
    if(this.pos==0){
        $('genres_item_0').className='submenu_genres_item_act_blue';
        $('genres_item_1').className='submenu_genres_item';
    }
    else
    {
        $('genres_item_1').className='submenu_genres_item_act_blue';
        $('genres_item_0').className='submenu_genres_item';
    }
}


settingsSubmenuLst.reset = function(){
    var some_temp_arr = ['submenugenres_title login_menu', 'submenugenres_title quality']
    this.prevPos = 0;
    this.pos = 0;
    serv_submenu_array = [lang_serv_auth, lang_serv_quality];
    $('genres_id').innerHTML='<div class="submenu_genres_item"></div>';
    for(var i=0; i<2; i++){    
        var obj = {
            'tag':'div',
            'attrs':
            {
                'class':'submenu_genres_item',
                'id': 'genres_item_'+i
            },
            'child':
            [
            {
                'tag':'div',
                'attrs':
                {
                    'class':some_temp_arr[i],
                    'html': serv_submenu_array[i]
                }
            }
            ]
        }
        $('genres_id').appendChild(createHTMLTree(obj));
    }
    $('submenu_genres').style.display = 'block';
    settingsSubmenuLst.onChange()
}


settingsSubmenuLst.onExit = function(){
    $('submenu_genres').style.display = 'none';
    $('genres_id').innerHTML = '<div class="submenu_genres_item"></div>';
    currLst = catLst;
    $('cat_'+catLst.pos).className = 'menu_item_special_act';
    currLst.onChange();
}


settingsSubmenuLst.onEnter = function(){
    $('genres_item_'+settingsSubmenuLst.pos).className = 'submenu_genres_item_act_blue_back';
    if(this.pos){
        prevLst=settingsSubmenuLst;
        currLst=settingsQualityLst;
        currLst.reset();
    }
    else{
        currLst = authLst;
        $('lang_footer_keyboard').style.display = 'block';
        currLst.reset();
    }
}
//////////////////////////  settingsSubmenuLst end  //////////////////////////////

//////////////////////////  SUBCAT LST PROTOTYPE  //////////////////////////////
subCatLst = new parent_lists_prototype();
subCatLst.length = 0;
subCatLst.maxLength = 3;
subCatLst.initialisated = -1;
subCatLst.layers = ['cats_page'];
subCatLst.offsetPage = subCatLst.page;
subCatLst.name = 'subCatLst';

subCatLst.list = [];
subCatLst.offset = 0;

subCatLst.page_length=3;

subCatLst.onChange = function(){
    echo('subCatLst.onChange');
    echo('video_files_total_num='+video_files_total_num);
    $('submenu').style.display = 'block';
    echo('this.pos='+this.pos+" prevPos="+this.prevPos+' this page='+this.page+' total position='+(this.page*3+this.pos+1));

    if(!this.page){
        $('submenu').getElementsByClassName('submenu_shadow_top')[0].style.display = 'none';}
    else{
        $('submenu').getElementsByClassName('submenu_shadow_top')[0].style.display = 'block';}
    if($('video_layer').innerHTML!=''){
        $('video_p'+this.prevPos).className = 'submenu_item';
        $('video_p'+this.pos).className = 'submenu_item_act_'+colors[catLst.pos];
    }
}

subCatLst.next = function(){
    this.prevPos = this.pos;
    this.direct = 'next';
    if(this.pos < 2 && this.page*3+this.pos+1 < video_files_total_num){
        this.pos++;
        this.onChange();
    }else{
        this.page++;
        if(this.page*this.page_length >= video_files_total_num){
            echo('that was end');
            this.page--;
            return;
        } 
        this.prevPos=0;
        this.pos=0;
        echo('nextnew this.pos = '+this.pos+' this.prevPos='+this.prevPos+' this.page='+this.page+' this.page_length='+this.page_length);

        this.direct = 'next';
        if(this.page+2<=vcat_num_of_pages-1){
            // выбор из списка меню - для которого из них загружать следующую порцию
            if(!catLst.pos){
                sendreq(megogoURL+'p/recommend?'+createSign({
                    'session':session, 
                    'offset':(this.page+2)*this.page_length, 
                    'limit':4,'lang':lang
                }), bufferForVerticalCat,true);
            }
        
            if(catLst.pos == (catLst.length-3)){
                sendreq(megogoURL+'p/favorites?'+createSign({
                    'session':session, 
                    'offset':(this.page+2)*this.page_length, 
                    'limit':4,'lang':lang
                }), bufferForVerticalCat,true);
            }
        }
        this.overflow();
    }
}


subCatLst.prev = function(){
    this.direct = 'prev';
    this.prevPos = this.pos;
    if(this.pos!=0){
        this.pos--;
        this.onChange();
    } else {
        if(this.page!=0){ 
            this.pos=2;
            this.page--;
            echo('prev this.pos = '+this.pos+' this.prevPos='+this.prevPos+' this.page='+this.page);
        
            this.direct = 'prev';
            if(this.page-2>=0 && this.page<vcat_num_of_pages-2){
                // выбор из списка меню - для которого из них загружать следующую порцию при движении назад
                if(!catLst.pos){
                    sendreq(megogoURL+'p/recommend?'+createSign({
                        'session':session, 
                        'offset':(this.page-2)*3, 
                        'limit':4,'lang':lang
                    }), bufferForVerticalCat,true);
                }
                
                if(catLst.pos == (catLst.length-3)){
                    sendreq(megogoURL+'p/favorites?'+createSign({
                        'session':session, 
                        'offset':(this.page-2)*3, 
                        'limit':4,'lang':lang
                    }), bufferForVerticalCat, true);
                }
            }
            this.overflow();
        }
    }
}

subCatLst.onPageUp = function(){  
    echo('subCatLst.onPageUp');
    if(this.page!=0) {
        this.page--;
        
        this.direct = 'prev';
        if(this.page-2>=0 && this.page<vcat_num_of_pages-2){
                // выбор из списка меню - для которого из них загружать следующую порцию при движении назад
                if(!catLst.pos){
                    sendreq(megogoURL+'p/recommend?'+createSign({
                        'session':session, 
                        'offset':(this.page-2)*3, 
                        'limit':4,'lang':lang
                    }), bufferForVerticalCat,true);
                }
                
                if(catLst.pos == (catLst.length-3)){
                    sendreq(megogoURL+'p/favorites?'+createSign({
                        'session':session, 
                        'offset':(this.page-2)*3, 
                        'limit':4,'lang':lang
                    }), bufferForVerticalCat, true);
                }
            }
            
        this.overflow();
    }
}


subCatLst.onPageDown = function(){
    echo('subCatLst.onPageDown');
    echo("catLst.pos="+catLst.pos);
    this.page++;
    if(this.page*this.page_length >= video_files_total_num){
        this.page--;
    } 
    else 
    {
        this.direct = 'next';
        if(this.page+2<=vcat_num_of_pages-1){            
            // выбор из списка меню - для которого из них загружать следующую порцию
            if(!catLst.pos){
                sendreq(megogoURL+'p/recommend?'+createSign({
                    'session':session, 
                    'offset':(this.page+2)*this.page_length, 
                    'limit':4,'lang':lang
                }), bufferForVerticalCat,true);
            }
        
            if(catLst.pos == (catLst.length-3)){
                sendreq(megogoURL+'p/favorites?'+createSign({
                    'session':session, 
                    'offset':(this.page+2)*this.page_length, 
                    'limit':4,'lang':lang
                }), bufferForVerticalCat,true);
            }
        }
            
        this.overflow();
    }
}


subCatLst.overflow = function(){
    echo('this is owerflow');
    if(this.page*3==video_files_total_num || this.page*3+1==video_files_total_num){
        initVerticalList(main_video_files_list, subCatLst.page*3, 4, '');
        subCatLst.onChange(); 
    }else{
        if(main_video_files_list[subCatLst.page*subCatLst.page_length]!==undefined && main_video_files_list[subCatLst.page*subCatLst.page_length+1]!==undefined){
            initVerticalList(main_video_files_list, subCatLst.page*3, 4, '');
            subCatLst.onChange();  
        }else{
            echo('data not ready');
            var setInterval_ID = setInterval(function(){
                if(this.page*3==video_files_total_num){
                    initVerticalList(main_video_files_list, subCatLst.page*3, 4, '');
                    subCatLst.onChange(); 
                }else{
                    echo('setInterval_ID='+setInterval_ID);
                    echo('set interval main_video_files_list[this.page='+subCatLst.page+'*this.page_length='+subCatLst.page_length+']='+main_video_files_list[subCatLst.page*subCatLst.page_length]);
                    if(main_video_files_list[subCatLst.page*subCatLst.page_length]!=undefined && main_video_files_list[subCatLst.page*subCatLst.page_length+1]!==undefined) {
                        clearInterval(setInterval_ID);
                        close_loading_attention();
                        echo('initVerticalList____________________________catalog_drawing');
                        initVerticalList(main_video_files_list, subCatLst.page*subCatLst.page_length, subCatLst.page_length, '');
                        subCatLst.onChange();    
                    }else{   
                        show_loading_attention(lang_loading_message);
                        loading_read_retry_number++;
                        echo('loading_read_retry_number'+loading_read_retry_number);
                        if(loading_read_retry_number>=150){       // если данные так и не пришли от сервера в течении двух с половиной минут 
                            echo('end for this request=');
                            loading_read_retry_number=0;
                            echo('setInterval_ID='+setInterval_ID);
                            clearInterval(setInterval_ID);
                            close_loading_attention();
                            subCatLst.onExit();
                            prevLst=currLst;
                            currLst=modalLst;
                            show_auth_request(lang_message_server_no_ansver);
                        }
                    }
                }
            }, 1000)
        }
    }
}

subCatLst.onExit = function(){
    echo("catLst.pos="+catLst.pos);
    $('video_p'+this.pos).className = 'submenu_item';
    $('submenu').style.display = 'none';
    $('video_layer').innerHTML = '';
    subCatLst_reset_flag=true;
    echo('subCatLst_reset_flag=true'+subCatLst_reset_flag);
    main_video_files_list=[];
    loading_read_retry_number=0;
    request_attempt=[];
    vertical_cat_buffer=0;
    currLst = catLst;
    $('cat_'+catLst.pos).className = 'menu_item_'+colors[catLst.pos]+'_act';
    echo('new COLOR is = '+'menu_item_'+colors[this.pos]+'_act');
    echo("catLst.pos="+catLst.pos);
    currLst.onChange();
}



subCatLst.onEnter = function(){
    $('cats_page').style.display = 'none';
    $('info_page').style.display = 'block';
    subCatLst.offset = subCatLst.page*3+subCatLst.pos;
    this.dataset = main_video_files_list;
    this.offsetPage = this.page;
    subCatLst.initialisated = subCatLst.offset;
    switchMovieInfo(subCatLst);
    currLst = movieInfoLst;
    prevLst = subCatLst;
    movieInfoLst.color = colors[catLst.pos];
    currLst.reset();
    currLst.onChange();
}


subCatLst.reset = function(){
    subCatLst_reset_flag=false;
    echo('subCatLst.reset()');
    this.pos = 0;
    this.prevPos = 0;
    this.page = 0;
    this.direct = '';
    echo('(vertical_cat_buffer.limit)='+vertical_cat_buffer.limit);
    video_files_total_num=vertical_cat_buffer.total_num; // вычисляем количество фильмов в категории
    vcat_num_of_pages=Math.ceil(video_files_total_num/3);    // количество страниц
    echo('vcat_num_of_pages='+vcat_num_of_pages);
    for(var i=0; i<vertical_cat_buffer.video_list.length; i++){ // переносим видеоданные из ответа в общий массив видеофайлов
        main_video_files_list[i]= vertical_cat_buffer.video_list[i];
    }
    initVerticalList(main_video_files_list, 0, this.page_length, '');
}
////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////
movieInfoLst = new parent_lists_prototype();
movieInfoLst.color = 'blue';
movieInfoLst.id = ['info_0', 'info_1', 'info_2', 'info_3', 'info_4', 'info_5', 'info_6'];
movieInfoLst.layers = ['movieinfo_general_id',  'movieinfo_actors_id', 'alt_submenu', '', 'movieinfo_comments_id', 'movieinfo_submenu']; //, 'movieinfo_quality'];
movieInfoLst.length = movieInfoLst.id.length;
movieInfoLst.descrPage = 0;
movieInfoLst.name = 'movieInfoLst';


movieInfoLst.reset = function(){
    if(!session){
        $('info_3').style.display = 'none';
        $('info_5').style.display = 'none';
    }
    else{
        $('info_3').style.display = 'block';
        $('info_5').style.display = 'block';
    }
    this.pos = this.prevPos = 0;

    var text= new Array();
    if(file != undefined){
        if(!empty(file.video[0].alt_video))
        {
            text['video_list'] = file.video[0].alt_video;
            echo('there is some alt video'+file.video[0].alt_video);
            
            init_contentlist(text, 'alt_');
        }
    }
    try{
        $('movieinfo_comments_id').getElementsByClassName('movieinfo_gradient_top')[0].style.display = "none";
        $('movieinfo_comments_id').getElementsByClassName('movieinfo_gradient_bottom')[0].style.display = "none";
    }
    catch(err){
        echo('error at movieInfoLst.reset');
    }
    $('info_page').children[0].className = "movieinfo_back_"+movieInfoLst.color;

    for(var i = 0; i<this.length;i++)
        $(this.id[i]).className ="movieinfo_menuitem";

    currLst=descriptionMovieLst;
    descriptionMovieLst.length = 3;
    currLst.onChange();
    currLst=movieInfoLst;

    movieInfoLst.onChange();
}


movieInfoLst.next = function(){
    this.direct = 'next';
    if(this.pos < 6)
    {
        this.prevPos = this.pos;
        this.pos++;
        echo('this.pos++='+this.pos);
        while(($('info_'+this.pos).style.display === 'none'))
        {
            if(this.pos >= 6){
                this.pos = this.prevPos;
                break;
            }
            else
            {
                this.pos++;
            }
        }
    }
    echo('this.pos='+this.pos); 
    this.onChange();
}


movieInfoLst.prev = function(){
    this.direct = 'prev';
    if(this.pos>0)
    {
        this.pos--;    
        echo('this.pos--='+this.pos);
        while(($('info_'+this.pos).style.display === 'none'))
        {   
            echo('cycle is working...');
            if(this.pos < 1){
                break;
            }
            else
            {
                this.pos--;
            }
        }   
    }
    this.onChange();
}


movieInfoLst.onChange = function(){
    if(this.pos == 0 || this.pos==1 || this.pos==4)
        $('footer_page').style.display = 'block';
    else $('footer_page').style.display = 'none';
        
    for(var i=0;i<movieInfoLst.id.length;i++)
    {
        $(this.id[i]).className ="movieinfo_menuitem";
    }
    $(this.id[this.pos]).className ="movieinfo_menuitem_"+movieInfoLst.color;

    for(var i in this.layers){
        if(this.layers[i] != '')
            $(this.layers[i]).style.display = 'none';
    }
    if(this.layers[i] != '' && this.pos!=3 && this.pos!=6)
        $(this.layers[this.pos]).style.display = 'block';
    switch(this.pos){
        case 0:
            currLst = descriptionMovieLst;
            currLst.reset();
            currLst = movieInfoLst;
            break;
    
        case 1:
            currLst = actorsMovieLst;
            currLst.reset();
            currLst = movieInfoLst;
            break;
    
        case 4:
            currLst = commentsMovieLst;
            currLst.reset();
            currLst = movieInfoLst;
            break;
    }
}


movieInfoLst.onPageDown = function(){
    switch(this.pos){
        case 0:
            currLst = descriptionMovieLst;
            descriptionMovieLst.next();
            currLst = movieInfoLst;
            break;
    
        case 1:
            currLst = actorsMovieLst;
            actorsMovieLst.next();
            currLst = movieInfoLst;
            break;
    
        case 4:
            currLst = commentsMovieLst;
            commentsMovieLst.next();
            currLst = movieInfoLst;
            break;
    }
}


movieInfoLst.onPageUp = function(){
    echo('movieInfoLst.onPageUp this.pos='+this.pos);
    switch(this.pos){
        case 0:
            currLst = descriptionMovieLst;
            descriptionMovieLst.prev();
            currLst = movieInfoLst;
            break;
        case 1:
            currLst = actorsMovieLst;
            actorsMovieLst.prev();
            currLst = movieInfoLst;
            break;
        case 4:
            currLst = commentsMovieLst;
            commentsMovieLst.prev();
            currLst = movieInfoLst;
            break;
    }
}


movieInfoLst.onEnter = function(){
    switch(this.pos){
        case 0:
            echo('movieInfoLst.onEnter fileInfo.isSeries='+fileInfo.isSeries);
            descriptionMovieLst.onExit();
            if(fileInfo.isSeries==0){            // фильм
                sesies_getdata(fileInfo.id);
                $('info_page').style.display = 'none';
            }
            else{                                // сериал
                currLst = seriesLst;
                $('info_page').style.display = 'none';
                $('menu_series').style.display = 'block';
                echo('movieInfoLst.onEnter fileInfo.isSeries!=0');
                currLst.reset();
            }
            break;
        case 1:
            if (!$('movieinfo_actors_id').children.length)
                break;
            currLst = actorsMovieLst ;
             $('info_'+movieInfoLst.pos).className = 'movieinfo_menuitem_'+colors[catLst.pos]+'_back';
            currLst.reset();
            break;
        case 2:
            echo('movieInfoLst.onEnter->prevLst='+prevLst.name);
             $('info_'+movieInfoLst.pos).className = 'movieinfo_menuitem_'+colors[catLst.pos]+'_back';
            currLst = proposalMovieLst;
            currLst.page=0;
            currLst.pos=0;
            currLst.prevPos=0;
            currLst.onChange();
            current_film_id='';
            break;
        case 3:
            current_film_id='';
            if(!session){
                show_auth_request(lang_auth_request);
                break;
            }
            if($('info_3').innerHTML != lang.info_3)  
                sendreq(iviURL+'removefavorite?'+createSign({
                    'video':fileInfo['id'], 
                    'session':session
                }),setFavorits);
            else
                sendreq(iviURL+'addfavorite?'+createSign({
                    'video':fileInfo['id'], 
                    'session':session
                }),setFavorits);
            break;
        case 4:
            if (!$('movieinfo_comments_id').children.length)
                break;
            currLst = commentsMovieLst ;
             $('info_'+movieInfoLst.pos).className = 'movieinfo_menuitem_'+colors[catLst.pos]+'_back';
            currLst.reset();
            break;
        case 5:
            if(file.video[0].vote!=0 && file.video[0].vote!=1 && $('lang_like').innerHTML != lang_already_voted)
            {   
                $('info_'+movieInfoLst.pos).className = 'movieinfo_menuitem_'+colors[catLst.pos]+'_back';
                currLst = likeLst;
                currLst.reset();
            }
            break;
        case 6:
            currLst = movieinfoQualityLst;
             $('info_'+movieInfoLst.pos).className = 'movieinfo_menuitem_'+colors[catLst.pos]+'_back';
            currLst.reset();
            break;           
    }
}


movieInfoLst.onLeft = function(){
    movieInfoLst.onExit();
}


movieInfoLst.onExit = function(){
    current_video_quality='';
    descriptionMovieLst.onExit();
    currLst = prevLst;
    echo('movieInfoLst.onExit->prevLst='+prevLst.name);
    currLst.onChange();
    $('info_page').style.display = 'none';
    $(this.id[this.pos]).className ="movieinfo_menuitem";
    for(var i=0; i<currLst.layers.length; i++){
        $(currLst.layers[i]).style.display = 'block';
    }
    $('footer_page').style.display = 'none';
    episodeLst.pos=episodeLst.prevPos=0;
    seasonLst.pos=seasonLst.prevPos=0;
    // обнуляем позиции, значения и списки меню качеств
    $('movieinfo_quality_id').innerHTML = '';
    $('bitrates_id').innerHTML = '';
    movieinfoQualityLst.length = 0;
    bitratesLst.length = 0;
    current_video_quality = '';
    // чистим комментарии
    $('comments_scrolling_div').innerHTML = '';
    // чистим полное дерево сезонов и серий
    seasonLst.SeasonsAndEpisodesArr=[];
    seasonLst.season_number=0;
    episodeLst.episode_number=0;
    // чистим id текущего фильма
    current_film_id='';
}
//////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////  commentsMovieLst  //////////////////////////////////
commentsMovieLst = new parent_lists_prototype();
commentsMovieLst.length = 1;
commentsMovieLst.maxPage = 0;
commentsMovieLst.name = 'commentsMovieLst';
commentsMovieLst.scrolling_position = 0;
commentsMovieLst.scrolling_list = 0;
commentsMovieLst.visible_borders = 0;
commentsMovieLst.step=step_for_infomenu_scrolling;
commentsMovieLst.offset=0;
commentsMovieLst.total_num=0;

commentsMovieLst.reset = function(){
    this.scrolling_position = 0;
    $('movieinfo_comments_id').getElementsByClassName('movieinfo_gradient_top')[0].style.display = "block";
    $('movieinfo_comments_id').getElementsByClassName('movieinfo_gradient_bottom')[0].style.display = "block";
    this.scrolling_list =  $('comments_scrolling_div').clientHeight;
    this.visible_borders = $('movieinfo_comments_id').clientHeight;
    echo('reset: client height at commentsMovieLst is: scrolling_list= '+this.scrolling_list+' visible_borders='+this.visible_borders); 
    if(this.scrolling_list>this.visible_borders-this.step) $('comments_scr_arrow_bottom').style.display = 'block';
    this.onChange();
}


commentsMovieLst.onPageUp= function(){
    commentsMovieLst.prev();
}


commentsMovieLst.onPageDown = function(){
    commentsMovieLst.next();
}


commentsMovieLst.next= function(){
    echo('pgdn scroll up -');
    if(this.scrolling_list>this.visible_borders-this.step && this.scrolling_position*(-1)<this.scrolling_list-this.visible_borders+3*this.step)
    {
        this.scrolling_position-=this.step;
        echo('this.scrolling_position-=50='+this.scrolling_position);
        $('comments_scrolling_div').style.top= this.scrolling_position+'px';
     this.onChange();       
    }
    else{
        if(this.offset<this.total_num){
            // запрос на список комментариев
            var url = {
                'video':fileInfo.id, 
                'session':session,
                'offset':this.offset,
                'limit':30
            }
            sendreq(iviURL+'comments?'+createSign(url),fillCommentsList);
        }
    }

}


commentsMovieLst.prev= function(){
    echo('pgup scroll dn +');
    if(this.scrolling_list>this.visible_borders-this.step && this.scrolling_position<0)
    {
        this.scrolling_position+=this.step;
        echo('this.scrolling_position+=50='+this.scrolling_position);
        $('comments_scrolling_div').style.top= this.scrolling_position+'px';
    }
    this.onChange();
}


commentsMovieLst.onExit = function(){
    $('movieinfo_comments_id').getElementsByClassName('movieinfo_gradient_top')[0].style.display = "none";
    $('movieinfo_comments_id').getElementsByClassName('movieinfo_gradient_bottom')[0].style.display = "none";
    $('comments_scr_arrow_bottom').style.display = 'none';
    $('comments_scr_arrow_top').style.display = 'none';
    this.scrolling_position=0;
    $('comments_scrolling_div').style.top= this.scrolling_position+'px';
    this.scrolling_list = 0;
    this.visible_borders = 0;
    currLst = movieInfoLst;
    $('info_'+movieInfoLst.pos).className = 'movieinfo_menuitem_blue';
    currLst.onChange();
}

commentsMovieLst.onChange = function(){
    if(this.scrolling_position<0)
        $('comments_scr_arrow_top').style.display = 'block';
    else 
        $('comments_scr_arrow_top').style.display = 'none';
    if(this.scrolling_list>this.visible_borders-this.step && this.scrolling_position*(-1)<this.scrolling_list-this.visible_borders+2*this.step)
        $('comments_scr_arrow_bottom').style.display = 'block';
    else 
        $('comments_scr_arrow_bottom').style.display = 'none';
}
//////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////
actorsMovieLst = new parent_lists_prototype();
actorsMovieLst.length = 1;
actorsMovieLst.name = 'actorsMovieLst';
actorsMovieLst.scrolling_position = 0;
actorsMovieLst.scrolling_list = 0;
actorsMovieLst.visible_borders = 0;
actorsMovieLst.step=step_for_infomenu_scrolling;
actorsMovieLst.onPageUp= function(){
    actorsMovieLst.prev();
}


actorsMovieLst.onPageDown = function(){
    actorsMovieLst.next();
}


actorsMovieLst.reset = function(){
    this.scrolling_position = 0;
    $('movieinfo_actors_id').getElementsByClassName('movieinfo_gradient_top')[0].style.display = "block";
    $('movieinfo_actors_id').getElementsByClassName('movieinfo_gradient_bottom')[0].style.display = "block";
    this.scrolling_list =  $('actors_scrolling_div').clientHeight;
    this.visible_borders = $('movieinfo_actors_id').clientHeight;
    echo('reset: client height at actors is: scrolling_list= '+this.scrolling_list+' visible_borders='+this.visible_borders); 
    if(this.scrolling_list>this.visible_borders-2*this.step) $('actors_scr_arrow_bottom').style.display = 'block';
    this.onChange();
}


actorsMovieLst.next= function(){
    echo('scroll up -');
    if(this.scrolling_list>this.visible_borders-2*this.step && this.scrolling_position*(-1)<this.scrolling_list-this.visible_borders+2*this.step)
    {
        this.scrolling_position-=this.step;
        echo('this.scrolling_position-=50='+this.scrolling_position);
        $('actors_scrolling_div').style.top= this.scrolling_position+'px';
    }
    actorsMovieLst.onChange();
}


actorsMovieLst.prev= function(){
    echo('scroll dn +');
    if(this.scrolling_list>this.visible_borders-2*this.step && this.scrolling_position<0)
    {
        this.scrolling_position+=this.step;
        echo('this.scrolling_position+=50='+this.scrolling_position);
        $('actors_scrolling_div').style.top= this.scrolling_position+'px';
    }
    actorsMovieLst.onChange();
}


actorsMovieLst.onExit = function(){
    $('movieinfo_actors_id').getElementsByClassName('movieinfo_gradient_top')[0].style.display = "none";
    $('movieinfo_actors_id').getElementsByClassName('movieinfo_gradient_bottom')[0].style.display = "none";
    $('actors_scr_arrow_bottom').style.display = 'none';
    $('actors_scr_arrow_top').style.display = 'none';
    this.scrolling_position=0;
    $('actors_scrolling_div').style.top= this.scrolling_position+'px';
    currLst = movieInfoLst;
    $('info_'+movieInfoLst.pos).className = 'movieinfo_menuitem_'+colors[catLst.pos];
    currLst.onChange();
}


actorsMovieLst.onChange = function(){
    if(this.scrolling_position<0)
        $('actors_scr_arrow_top').style.display = 'block';
    else 
        $('actors_scr_arrow_top').style.display = 'none';
    if(this.scrolling_list>this.visible_borders-2*this.step && this.scrolling_position*(-1)<this.scrolling_list-this.visible_borders+2*this.step)
        $('actors_scr_arrow_bottom').style.display = 'block';
    else 
        $('actors_scr_arrow_bottom').style.display = 'none';
}


actorsMovieLst.overflow = function(){
    }
////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////  descriptionMovieLst  //////////////////////////////////
descriptionMovieLst = new parent_lists_prototype();
descriptionMovieLst.name = 'descriptionMovieLst';
descriptionMovieLst.length = 3;
descriptionMovieLst.scrolling_position = 0;
descriptionMovieLst.scrolling_list = 0;
descriptionMovieLst.visible_borders = 0;
descriptionMovieLst.step=step_for_infomenu_scrolling;


descriptionMovieLst.reset = function(){
    this.scrolling_position = 0;
    $('movieinfo_general_id').getElementsByClassName('movieinfo_gradient_top')[0].style.display = "block";
    $('movieinfo_general_id').getElementsByClassName('movieinfo_gradient_bottom')[0].style.display = "block";
    this.scrolling_list =  $('descr_scrolling_div').clientHeight;
    this.visible_borders = $('movieinfo_general_id').clientHeight;
    echo('reset: client height at description is: scrolling_list= '+this.scrolling_list+' visible_borders='+this.visible_borders); 
    if(this.scrolling_list>this.visible_borders-this.step) $('descr_scr_arrow_bottom').style.display = 'block';
    this.onChange();
}


descriptionMovieLst.next= function(){
    echo('scroll up -');
    if(this.scrolling_list>this.visible_borders-this.step && this.scrolling_position*(-1)<this.scrolling_list-this.visible_borders+2*this.step)
    {
        this.scrolling_position-=this.step;
        echo('this.scrolling_position-=50='+this.scrolling_position);
        $('descr_scrolling_div').style.top= this.scrolling_position+'px';
    }
    descriptionMovieLst.onChange();
}


descriptionMovieLst.prev= function(){
    echo('scroll dn +');
    if(this.scrolling_list>this.visible_borders-this.step && this.scrolling_position<0)
    {
        this.scrolling_position+=this.step;
        echo('this.scrolling_position+=50='+this.scrolling_position);
        $('descr_scrolling_div').style.top= this.scrolling_position+'px';
    }
    descriptionMovieLst.onChange();
}


descriptionMovieLst.onExit = function(){
    $('movieinfo_general_id').getElementsByClassName('movieinfo_gradient_top')[0].style.display = "none";
    $('movieinfo_general_id').getElementsByClassName('movieinfo_gradient_bottom')[0].style.display = "none";
    $('descr_scr_arrow_bottom').style.display = 'none';
    $('descr_scr_arrow_top').style.display = 'none';
    descriptionMovieLst.scrolling_position=0;
    $('descr_scrolling_div').style.top= descriptionMovieLst.scrolling_position+'px';
    descriptionMovieLst.scrolling_list = 0;
    descriptionMovieLst.visible_borders = 0;
    currLst = movieInfoLst;
    currLst.onChange();
}

descriptionMovieLst.onChange = function(){
    if(this.scrolling_position<0)
        $('descr_scr_arrow_top').style.display = 'block';
    else 
        $('descr_scr_arrow_top').style.display = 'none';
    if(this.scrolling_list>this.visible_borders-this.step && this.scrolling_position*(-1)<this.scrolling_list-this.visible_borders+2*this.step)
        $('descr_scr_arrow_bottom').style.display = 'block';
    else 
        $('descr_scr_arrow_bottom').style.display = 'none';
}
/////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////  proposalMovieLst  /////////////////////////
proposalMovieLst = new parent_lists_prototype();
proposalMovieLst.length = 3;

proposalMovieLst.next = function(){
    this.prevPos = this.pos;
    this.direct = 'next';
    if(this.pos < this.length-1 && this.pos < (file.video[0].alt_video.length-this.page*this.length)-1)
        this.pos++;
    else{
        this.page++;
        this.pos = 0;
        this.overflow();
    }
    echo('this.prev='+this.prevPos+'this.pos='+this.pos+'this.length='+file.video[0].alt_video.length);
    this.onChange();
}


proposalMovieLst.prev = function(){
    this.direct = 'prev';
    this.prevPos = this.pos;
    if(this.pos)
        this.pos--;
    else{
        if(this.length)
            this.pos = this.length-1;
        this.page--;
        this.overflow();
    }
    echo('this.prev='+this.prevPos+'this.pos='+this.pos+'this.length='+file.video[0].alt_video.length);
    this.onChange();
}


proposalMovieLst.onChange = function(){
    if(this.length>3)
        this.length = 3;
    var arr = $('alt_video_layer');
    arr.children[this.prevPos].className = 'submenu_item';
    arr.children[this.pos].className = 'submenu_item_act_'+colors[catLst.pos];
}

proposalMovieLst.refreshPage=function(){
    if (this.page >= file.video[0].alt_video.length/cont_page_max)
        this.page = 0;
    if (this.page < 0){
        this.page = file.video[0].alt_video.length/cont_page_max;
    }
    text= new Array();      
    tmp = file.video[0].alt_video;
    tmp1 = tmp.concat([]);
    tmp1.reverse();
    text['video_list'] = tmp.concat(tmp1);
    text['video_list'] = text['video_list'].slice(this.page*cont_page_max);
    init_contentlist(text, 'alt_');
}


proposalMovieLst.onExit = function(){
    var arr = $('alt_video_layer');
    arr.children[this.pos].className = 'submenu_item';
    this.pos=0;
    this.prevPos=0;
    this.page=0;
    this.lenght = 3;
    this.overflow();
    echo('proposalMovieLst.onExit->prevLst='+prevLst.name);
    currLst = movieInfoLst;
    $('info_'+movieInfoLst.pos).className = 'movieinfo_menuitem_'+colors[catLst.pos];
    currLst.onChange();
}

proposalMovieLst.onEnter = function(){
    if(catLst.pos==(catLst.length-2))
        prevLst = searchResultLst;
    if(catLst.pos>0 && catLst.pos<(catLst.length-3))
        prevLst = extSubCatLst;
    if(catLst.pos==(catLst.length-3) || catLst.pos==0)
        prevLst = subCatLst;
    subCatLst.initialisated = -1;
    $('info_page').style.display = 'block';
    var arr = $('alt_video_layer');
    arr.children[this.pos].className = 'submenu_item';
    this.offset =this.pos;
    switchMovieInfo(this);
    this.page=0;
    this.pos=0;
    currLst = movieInfoLst;
    echo('proposal movie in prop movie -> color=blue');
    currLst.reset();
    currLst.onChange();
}


proposalMovieLst.overflow = function(){
    var text = new Array();
    if(this.page == -1){
        this.page = 0;
        this.pos = 0;
    }
    if(this.page*3>=file.video[0].alt_video.length){
        this.page = Math.ceil(file.video[0].alt_video.length/3)-1;
        echo('proposalMovieLst.overflow()->this.page='+this.page);
        this.pos = this.prevPos;
    }
    else
    if(!empty(file.video[0].alt_video.length)){
        this.length = 0;
        var l = 3;
        text['video_list'] = new Array();
        for(var i = l*this.page, j=0; i<l*(this.page+1)+1; i++,j++){
            text['video_list'][j] = file.video[0].alt_video[i];
            this.length++;
            echo('proposalMovieLst.overflow()->this.length='+this.length);
        }
        init_contentlist(text, 'alt_');
    }
}
//////////////////////////////////////////////////


/////////////////////////////////////////////////
seriesLst = new parent_lists_prototype();
seriesLst.id = ['series_0', 'series_1', 'series_2', 'series_3'];
seriesLst.layers = ['', '', '', '', ''];
seriesLst.length = seriesLst.id.length;
seriesLst.bitrates = new Array();


seriesLst.reset = function(){
    if(!empty(fileInfo.isSeries)){
        $('series_1').innerHTML = '<div class="menu_season" ></div>'+$('episode_item_'+episodeLst.pos).children[0].innerHTML;
        $('series_1').style.display = 'block';
    }
    else
        $('series_1').style.display = 'none';
    currLst.onChange();
}


seriesLst.onChange = function(){
    $('footer_page').style.display = 'none';
    if(!empty(fileInfo.isSeries)){
        $('series_1').innerHTML = '<div class="menu_season" ></div>'+$('episode_item_'+episodeLst.pos).children[0].innerHTML;
        $('series_1').style.display = 'block';
    }
    else
        $('series_1').style.display = 'none';

    $(this.id[this.prevPos]).className ="menuseries_item";
    $(this.id[this.pos]).className ="menuseries_item_act";

    if(this.pos == 1 && empty(fileInfo.isSeries))
        if (!this.prevPos)
            this.next();
        else this.prev();

    if(fileInfo.isSeries)
        $('series_1').innerHTML = '<div class="menu_season" ></div>'+ $('episode_item_'+episodeLst.pos).children[0].innerHTML;
}


seriesLst.onEnter = function(){
    echo('seriesLst.onEnter->this.pos'+this.pos);
    switch(this.pos){
        case 0:
            startPosFromContinue=0;
            sesies_getdata(fileInfo.id);
            if(empty($('season_item_1'))){
                tmp = $('menu_series').children;
                if(tmp[1].className == 'submenu_series'){
                    $('submenu_series').className = 'submenu_series2';
                    $('submenu_series2').className = 'submenu_series';
                }
            }
            else{
                $('submenu_series').className = 'submenu_series';
                $('submenu_series2').className = 'submenu_series2';
            }
            $('menu_series').style.display = 'none';
            break;
        case 1:
            $('series_1').className = 'menuseries_item_act_back';
            if(empty($('season_item_1'))){
                echo('___________________episode list was chosen');
                currLst = episodeLst;
                echo('currLst = episodeLst;');
                tmp = $('menu_series').children;
                if(tmp[1].className == 'submenu_series'){
                    $('submenu_series').className = 'submenu_series2';
                    $('submenu_series2').className = 'submenu_series';
                    if(fileInfo.isSeries){
                        episodeLst.prevPos = episodeLst.pos;
                        episodeLst.pos=0;
                        episodeLst.page=0;
                        episodeLst.onChange();
                    }
                }
            }
            else{
                echo('___________________season list was chosen');
                $('submenu_series').className = 'submenu_series';
                $('submenu_series2').className = 'submenu_series2';
                currLst = seasonLst;
                if(fileInfo.isSeries){
                    seasonLst.prevPos = this.pos;
                    seasonLst.pos=0;
                    seasonLst.page=0;
                    seasonLst.onChange();
                }
            }
            break;
        case 2:
            currLst = bitratesLst;
            currLst.reset();
            $('series_2').className = 'menuseries_item_act_back';
            break;
        case 3: // пункт меню информации о фильме с назв "смотреть с начала"
                var tmp_id=0;
                // стирание записи о точке продолжения для выбранного видео
                if(fileInfo.isSeries){
                    tmp_id=urlVideo['episode'];    
                } else {
                    tmp_id=current_film_id;  
                }
            for(var key in videofiles_continue_array) {
                if(videofiles_continue_array[key].id===tmp_id){
                    videofiles_continue_array[key].time_pos=0;
                }
            }
            startPosFromContinue = 0;
            episodeLst.episode_number = 0;
            episodeLst.pos = 0;
            episodeLst.page = 0;
            seasonLst.season_number = 0;
            seasonLst.pos = 0;
            seasonLst.page = 0;
            sesies_getdata(fileInfo.id);
            $('menu_series').style.display = 'none';
            break;
    }
    currLst.onChange();
}


seriesLst.onExit = function(){
    $('menu_series').style.display = 'none';
    $('info_page').style.display = 'block';
    currLst = movieInfoLst;
    currLst.onChange();
}
/////////////////


/////////////////
bitratesLst = new parent_lists_prototype();
bitratesLst.idLst = [{}];
bitratesLst.val = '';

bitratesLst.reset = function(){
    this.pos = 0;
    var j,quality_numb;
    if(current_video_quality==''){ // если нет локально выбранного качества
        echo('current_video_quality=""');
        if(accpass.quality==''){ // и глобального тоже нет
            echo('accpass.quality=""');
            this.pos=0;
        }else{ // есть глобальное
            echo('seriesLst.bitrates.length='+seriesLst.bitrates.length);
            for(j=0; j<seriesLst.bitrates.length;j++){
                echo('accpass.quality='+accpass.quality+'p'+' seriesLst.bitrates[j].id='+seriesLst.bitrates[j].id);
                quality_numb=str_replace(seriesLst.bitrates[j].id, 'p', ''); // разные форматы данных
                this.pos=j;
                echo('this.pos='+this.pos); 
                if(quality_numb*1<=accpass.quality){ // сделанно для случая когда в глобальном выбранно качество отсутствующее в качествах фильма
                    break;
                }

            }
        }
    } else { // если есть локально выбранное качество
        echo('current_video_quality!=""');
        for(j=0; j<movieinfoQualityLst.length;j++){
            if(seriesLst.bitrates[j].id==current_video_quality){  // локальное ср с локальным списком качеств
                echo('current_video_quality='+current_video_quality+' seriesLst.bitrates[j].id='+seriesLst.bitrates[j].id);
                this.pos=j;
                echo('this.pos='+this.pos);
            }
        }
    }       
    this.prevPos = 0;
    bitratesLst.onChange();
    $('submenu_bitrates').style.display = 'block';
}

bitratesLst.onChange = function(){
    $('bitrates_item_'+this.prevPos).className ="submenu_series_item";
    $('bitrates_item_'+this.pos).className ="submenu_series_item_act";
    echo('bitratesLst.onChange()');
}


bitratesLst.onEnter = function(){
    echo('this.pos='+this.pos+' bitratesLst.length='+bitratesLst.length+' seriesLst.bitrates.length'+seriesLst.bitrates.length);
    bitratesLst.val = seriesLst.bitrates[this.pos].name;
    current_video_quality = seriesLst.bitrates[this.pos].name;
    current_video_quality = current_video_quality.substr(strpos(current_video_quality,'(',0)+1);
    current_video_quality = str_replace(current_video_quality,')','');
    echo('video bitratesLst.onEnter() at current_video_quality is '+current_video_quality);
    currLst.onExit();
}


bitratesLst.onExit = function(){
    this.prevPos=this.pos;
    this.pos=0;
    currLst.onChange();
    $('bitrates_item_'+this.pos).className ="submenu_series_item";
    $('submenu_bitrates').style.display = 'none';
    currLst = seriesLst;
    $('series_2').className = 'menuseries_item_act';
    currLst.onChange();
}


bitratesLst.overflow = function(){
    if(this.page>0){
        this.pos =  this.prevPos;
        this.page=0;
        this.onChange();
    }
    if (this.page<0){
        this.pos =  this.prevPos;
        this.page=0;
        this.onChange();
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////
movieinfoQualityLst = new parent_lists_prototype();
movieinfoQualityLst.idLst = [{}];
movieinfoQualityLst.val = '';

movieinfoQualityLst.reset = function(){
    this.pos = 0;
    var j,quality_numb;
    if(current_video_quality==''){
        echo('current_video_quality=""');
        if(accpass.quality==''){
            echo('accpass.quality=""');
            this.pos=0;
        }else{
            echo('seriesLst.bitrates.length='+seriesLst.bitrates.length);
            for(j=0; j<seriesLst.bitrates.length;j++){
                echo('accpass.quality='+accpass.quality+'p'+' seriesLst.bitrates[j].id='+seriesLst.bitrates[j].id);
                quality_numb=str_replace(seriesLst.bitrates[j].id, 'p', '');
                this.pos=j;
                echo('this.pos='+this.pos); 
                if(quality_numb*1<=accpass.quality){
                    break;
                }

            }
        }
    } else{
        echo('current_video_quality!=""');
        for(j=0; j<movieinfoQualityLst.length;j++){
            if(seriesLst.bitrates[j].id==current_video_quality){
                echo('current_video_quality='+current_video_quality+' seriesLst.bitrates[j].id='+seriesLst.bitrates[j].id);
                this.pos=j;
                echo('this.pos='+this.pos);
            }
        }
    }       
    this.prevPos = 0;
    movieinfoQualityLst.onChange();
    $('movieinfo_quality').style.display = 'block';
}


movieinfoQualityLst.onChange = function(){
    echo('this.pos='+this.pos+ ' this.prevPos='+this.prevPos+' this.length='+this.length);
    $('infoQuality_bitrates_item_'+this.prevPos).className ="submenu_series_item";
    $('infoQuality_bitrates_item_'+this.pos).className ="submenu_series_item_act_"+colors[catLst.pos];
}


movieinfoQualityLst.onEnter = function(){
    this.val = seriesLst.bitrates[this.pos].name;
    current_video_quality = seriesLst.bitrates[this.pos].name;
    current_video_quality = current_video_quality.substr(strpos(current_video_quality,'(',0)+1);
    current_video_quality = str_replace(current_video_quality,')','');
    echo('video movieinfoQualityLst.onEnter() at current_video_quality is '+current_video_quality);
    currLst.onExit();
}


movieinfoQualityLst.onExit = function(){
    $('infoQuality_bitrates_item_'+this.pos).className ="submenu_series_item";
    $('movieinfo_quality').style.display = 'none';
    this.prevPos=this.pos;
    this.pos=0;
    currLst.onChange();
    currLst = movieInfoLst;
    $('info_'+movieInfoLst.pos).className = 'movieinfo_menuitem_'+colors[catLst.pos];
    currLst.onChange();
}

movieinfoQualityLst.overflow = function(){
    if(this.page>0){
        this.pos =  this.prevPos;
        this.page=0;
        this.onChange();
    }
    if (this.page<0){
        this.pos =  this.prevPos;
        this.page=0;
        this.onChange();
    }
}
//////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////
settingsQualityLst = new parent_lists_prototype();
settingsQualityLst.length=8;

settingsQualityLst.reset = function(){
    if(accpass.quality==''){
        this.pos=7;
    }else{
        for(var j=0; j<video_quality_list.length;j++){
            if(video_quality_list[j]===accpass.quality){
                this.pos=j;
            }
        }
}
    this.prevPos=0;
    $('sub_genres_id').innerHTML='<div class="submenu_genres_item"></div>';
    for(var i=0; i<8; i++){    
        var obj = {
            'tag':'div',
            'attrs':
            {
                'class':'submenu_genres_item',
                'id': 'sub_genres_item_'+i
            },
            'child':
            [
            {
                'tag':'div',
                'attrs':
                {
                    'class':'submenugenres_title',
                    'id': 'submenugenres_title_'+i,
                    'html': lang_video_quality_list[i]+'<span class="quality_descr">'+video_resolutions_list[i]+'</span>'
                }
            }
            ]
        }
        $('sub_genres_id').appendChild(createHTMLTree(obj));
    }
    
    $('sub_genres_item_'+this.pos).className ='submenu_genres_item_act_blue_no_arr';
    echo($('sub_genres_item_'+this.pos).className);
    $('sub_submenu_genres').style.display = 'block';    
}


settingsQualityLst.onChange = function(){
    echo($('sub_genres_item_'+this.pos).className);
    $('sub_genres_item_'+this.prevPos).className ='submenu_genres_item';    
    echo('this.pos = '+this.pos);
    $('sub_genres_item_'+this.pos).className ='submenu_genres_item_act_blue_no_arr';
}

settingsQualityLst.onLeft = function(){
    currLst.onExit();
}


settingsQualityLst.onEnter = function(){
    accpass.quality=video_quality_list[this.pos];
    echo("data saving login = "+accpass.login+' pass = '+accpass.pass+' quality = '+accpass.quality);
    stb.SaveUserData('megogofile','{"login":"'+accpass.login+'","pass":"'+accpass.pass+'","quality":"'+accpass.quality+'"}')
    currLst.onExit();
}


settingsQualityLst.onExit = function(){
    $('sub_submenu_genres').style.display = 'none';
    currLst = settingsSubmenuLst;
    $('genres_item_'+settingsSubmenuLst.pos).className = 'submenu_genres_item_act_blue';
}

settingsQualityLst.overflow = function(){
    if(this.page>0){
        this.pos =  this.prevPos;
        this.page=0;
        this.onChange();
    }
    if (this.page<0){
        this.pos =  this.prevPos;
        this.page=0;
        this.onChange();
    }
}
//////////////////////////////


///////////////////////////////////////


seasonLst = new parent_lists_prototype();
seasonLst.length = seasonLst.id.length;
seasonLst.name='seasonLst';
seasonLst.season_number=0;
seasonLst.SeasonsAndEpisodesArr=[];


seasonLst.reset = function(){
    this.pos = this.prevPos = 0;
}

seasonLst.next = function(){ //down button action for submenu (genres list)
    seasonLst.prevPos = seasonLst.pos;
    seasonLst.direct = 'next';
    seasonLst.pos++;    
    if(seasonLst.pos < (seasonLst.SeasonsAndEpisodesArr.length)){
        echo("new pos++ = "+seasonLst.pos);
        if(seasonLst.pos<(seasonLst.SeasonsAndEpisodesArr.length-1) && /*$("genres_item_"+(this.pos+1)).style.display == "none" &&*/ this.pos>7){    
            $("season_item_"+(seasonLst.pos+1)).style.display = "block";
            $("season_item_"+(seasonLst.pos-8)).style.display = "none";  
        }
    }
    else{
        seasonLst.pos = seasonLst.prevPos;
    }
    seasonLst.onChange();
}

seasonLst.prev = function(){ //up button action for sub_menu (genres list)
    this.direct = 'prev';
    this.prevPos = this.pos;
    if(this.pos>0){
        this.pos--;
        echo("new pos-- = "+this.pos);
          if(this.pos>0  && $("season_item_"+(this.pos-1)).style.display == "none"){  
            $("season_item_"+(this.pos-1)).style.display = "block";
            $("season_item_"+(this.pos+8)).style.display = "none";  
        }
    }
    this.onChange();
}


seasonLst.onChange = function(){
    seasonLst.season_number=seasonLst.pos+seasonLst.page*vars[win.height].seriesLen;
    echo('seasonLst.season_number='+seasonLst.season_number+' this.prevPos='+seasonLst.prevPos+' this.pos='+seasonLst.pos+' this.page='+seasonLst.page);
    if ($('submenu_series').style.display == 'none')
        $('submenu_series').style.display = 'block';
    for(var i=0; i<seasonLst.length;i++){
        $('season_item_'+seasonLst.id[i]).className ="submenu_series_item";
    }
    $('season_item_'+seasonLst.id[seasonLst.pos]).className ="submenu_series_item_act";
    echo('name CurrLst= '+seasonLst.name);
    if(seasonLst.season_number>=seasonLst.SeasonsAndEpisodesArr.length){
        seasonLst.pos=seasonLst.prevPos;
        if(seasonLst.prevPos==(vars[win.height].seriesLen-1) && seasonLst.page>0){seasonLst.page--;}
    }
}


seasonLst.onEnter = function(){
    currLst = episodeLst;
    initSeriesLst(seasonLst.pos, 0);
    if(currLst.pos>=currLst.length){
        currLst.pos = 0;}
    episodeLst.prevPos=episodeLst.pos;
    episodeLst.pos=0;
    episodeLst.page=0;
    $('season_item_'+seasonLst.pos).className = 'submenu_series_item_act_back';
    currLst.onChange();
}


seasonLst.onExit = function(){
        for(var i=0; i<seasonLst.SeasonsAndEpisodesArr.length;i++){
        $('season_item_'+this.id[i]).style.display = 'block';
    }
    $('submenu_series').style.display = 'none';
    currLst = seriesLst;
    $('series_1').className = 'menuseries_item_act';
    currLst.onChange();
}
///////////////////////////    seasonLst   ///////////////////////////////////////


///////////////////////////   episodeLst   ///////////////////////////////////////
episodeLst = new parent_lists_prototype();
episodeLst.length = episodeLst.id.length;
episodeLst.idLst = [{}];
episodeLst.name = 'episodeLst';
episodeLst.episode_number = 0;


episodeLst.reset = function(){
    this.pos = this.prevPos = 0;
}

episodeLst.onChange = function(){
    episodeLst.episode_number=this.pos+this.page*vars[win.height].seriesLen;
    echo('episodeLst.episode_number='+episodeLst.episode_number);
    if ($('submenu_series2').style.display == 'none')
        $('submenu_series2').style.display = 'block';
    $('series_1').innerHTML = '<div class="menu_season" ></div>'+$('episode_item_'+episodeLst.pos).children[0].innerHTML;
    if(byclass('submenu_series_item_act2')[0]!=undefined){
        echo('find');
        var tmp=byclass('submenu_series_item_act2');
        tmp[0].className = "submenu_series_item";
    }
    $('episode_item_'+this.pos).className ="submenu_series_item_act2";
        echo('name CurrLst= '+this.name);
}

episodeLst.onEnter = function(){
    startPosFromContinue = 0;
    sesies_getdata(fileInfo.id);
    $('menu_series').style.display = 'none';
}

episodeLst.overflow = function(){
    if(file.video[0].season_list[seasonLst.pos].episode_list[this.pos+this.page*this.maxLength]== undefined){
        this.pos =  this.prevPos;
        if (this.page>0)
            this.page--;
        else {
            this.page=0;
            this.pos=0;
        }
    }
    initSeriesLst(seasonLst.pos, this.page);
    currLst.onChange();
}


episodeLst.onExit = function(){

    $('submenu_series2').style.display = 'none';
    if(!empty($('season_item_1')))
        {currLst = seasonLst;}
    else
        {currLst = seriesLst;
        $('series_1').className = 'menuseries_item_act';}
    currLst.onChange();
}
/////////////////////////////   episodeLst  ///////////////////////////////////////


/////////////////////////////   searchLst строка для ввода поискового запроса ////////////////////////////////////////
searchLst = new parent_lists_prototype();
searchLst.id = ['search_line', 'search_line'];
searchLst.res = '';


searchLst.reset = function(){
    CUR_LAYER=layer_search;
    byclass('stripes_horizontal_act')[0].style.display = "none";
    $('lang_footer_return').style.display = "none";
    $('cats_page').style.display = 'none';
    $('modal_search1').style.display = 'block';
    $('search_modal_box').style.display='block'; 
    $('search_line').focus();
    currLst.onChange();
}


searchLst.onLeft = function(){
    }

searchLst.onRight = function(){
    }

searchLst.onUp = function(){
    echo('searchLst.onUp');
    $('search_line').blur();
    stb.HideVirtualKeyboard();
    currLst=suggestLst;
    currLst.onChange();
}


searchLst.onExit = function(){
    $('extsubmenu').style.display = 'none';
    $('modal_search1').style.display = 'none';
    $('cats_page').style.display = 'block';
    $("lang_footer_keyboard").style.display = "none";
    $('lang_footer_return').style.display = "none";
    currLst = catLst;
    $('cat_'+this.pos).className = 'menu_item_blue_act';
    currLst.onChange();
    $('search_line').blur();
    echo('keyhandler changing');
    CUR_LAYER=layer_cats;
}

searchLst.onRefresh = function(){  }

searchLst.onEnter = function(res){
    echo('searchLst.onEnter');
    if(empty(res)){
        get_suggest();
    }
    else{
        searchResult = ''
        searchLst.res = res;
        currLst = searchResultLst;
        searchResultLst.initialisated = -1;

        byclass('stripes_horizontal_act')[0].style.display = "block";
        $('extsubmenu').style.display = 'block';
        $('modal_search1').style.display = 'none';
        $("lang_footer_keyboard").style.display = "none";
        $('lang_footer_return').style.display = "block";
        echo('keyhandler changing');
        CUR_LAYER=layer_cats;
        $('search_line').blur();
        searchResultLst_reset_flag=true;
        search_buffer(res);
    }
}

searchLst.onChange = function(){

    stb.ShowVirtualKeyboard();
}


/////////////////////////////////    searchResultLst   /////////////////////
searchResultLst = new parent_lists_prototype();
searchResultLst.length = vars[win.height].ext_cont_page_x_max*2;
searchResultLst.layers = ['extsubmenu'];
searchResultLst.horizontal_pos=0;
searchResultLst.list = [];
searchResultLst.offset =0 ;
searchResultLst.name = 'searchResultLst';
searchResultLst.number_of_pages=0;
searchResultLst.page_length = vars[win.height].ext_cont_page_x_max*2;
searchResultLst.horizontal_pos=0;
searchResultLst.list_buffer=0;



searchResultLst.reset = function(){
    searchResultLst_reset_flag=false;
    echo('searchResultLst.reset()');
    this.pos = 0;
    this.prevPos = 0;
    this.page = 0;
    this.horizontal_pos=0;
    $('cats_page').style.display = 'none';
    $('extsubmenu').style.display = 'block';
    this.direct = '';
    echo('(extSubCatLst.list_buffer.limit=page_length->6|10)='+extSubCatLst.page_length);
    video_files_total_num=searchResultLst.list_buffer.total_num; // вычисляем количество фильмов в категории
    this.number_of_pages=Math.ceil(video_files_total_num/searchResultLst.page_length);    // количество страниц
    echo('this.number_of_pages='+this.number_of_pages);
    for(var i=0; i<this.list_buffer.video_list.length; i++){ // переносим видеоданные из ответа в общий массив видеофайлов
        main_video_files_list[i]= this.list_buffer.video_list[i];
        echo('first 18 to main_arr, ready from 18:'+i);
    }
    echo('searchResultLst.reset->initHorizontalList()');
    initHorizontalList(main_video_files_list, 0, this.page_length);
    this.onChange();
}


searchResultLst.onLeft = function(){
    this.prev();
}


searchResultLst.onRight = function(){
    this.next();
}


searchResultLst.onChange = function(){
    if ($('extsubmenu').style.display == 'none'){
        $('extsubmenu').style.display = 'block';
    }
    echo('oncange new this.pos = '+this.pos+' horiz_pos = '+this.horizontal_pos+' this.prevPos='+this.prevPos+' this.page='+this.page);
    if($('ext_video_p'+this.prevPos)!=undefined)
        $('ext_video_p'+this.prevPos).children[0].className = 'stripes_cover';
    if(video_files_total_num>0){
        $('ext_video_p'+this.pos).children[0].className = 'stripes_cover_act';
    }
    if(video_files_total_num<1){
        $('stripehorizontal_counter').innerHTML=lang_zero_search_rezult;
    } else   {
        $('stripehorizontal_counter').innerHTML=(searchResultLst.page*vars[win.height].ext_cont_page_x_max*2+searchResultLst.pos+1)+lang_extSubCatLst_counter+video_files_total_num;
    }
}


searchResultLst.onPageUp = function(){  
    echo('searchResultLst.onPageUp');
    if(this.page!=0) {
        this.page--;
            
        this.direct = 'prev';
        if(this.page-2>=0 && this.page<this.number_of_pages-2)
            sendreq(megogoURL+'p/search?'+createSign({
                'text':$('search_line').value, 
                'session':session,
                'offset':(this.page-2)*this.page_length,
                'limit':vars[win.height].ext_cont_page_x_max*2,'lang':lang
            }), search_buffer, true);
        this.overflow();
    }
}


searchResultLst.onPageDown = function(){
    echo('searchResultLst.onPageDown');
    this.page++;
    if(this.page*this.page_length >= video_files_total_num){
        this.page--;
    } 
    else 
    {    
        this.direct = 'next';
        if(this.page+2<=this.number_of_pages-1)
            sendreq(megogoURL+'p/search?'+createSign({
                'text':$('search_line').value, 
                'session':session,
                'offset':(this.page+2)*this.page_length,
                'limit':vars[win.height].ext_cont_page_x_max*2,'lang':lang
            }), search_buffer, true);
        this.overflow();
    }
}


searchResultLst.overflow = function(){
    if(main_video_files_list[searchResultLst.page*searchResultLst.page_length]!==undefined)
    {
        echo('initHorizontalList______________________search_catalog_drawing');
        initHorizontalList(main_video_files_list, searchResultLst.page*searchResultLst.page_length, searchResultLst.page_length);
        searchResultLst.onChange();
    }
    else 
    {
        echo('data not ready');
        var setInterval_ID = setInterval(function() {
            echo('setInterval_ID='+setInterval_ID);
            echo('set interval main_video_files_list[this.page='+searchResultLst.page+'*this.page_length='+searchResultLst.page_length+']='+main_video_files_list[searchResultLst.page*searchResultLst.page_length]);
            if(main_video_files_list[searchResultLst.page*searchResultLst.page_length]!=undefined) {
                clearInterval(setInterval_ID);
                close_loading_attention();
                echo('initHorizontalList______________________search_catalog_drawing');
                initHorizontalList(main_video_files_list, searchResultLst.page*searchResultLst.page_length, searchResultLst.page_length);
                searchResultLst.onChange();    
            }
            else
            {   
                show_loading_attention(lang_loading_message);
                loading_read_retry_number++;
                echo('loading_read_retry_number'+loading_read_retry_number);
                if(loading_read_retry_number>=150){       // если данные так и не пришли от сервера в течении двух с половиной минут 
                    echo('end for this request=');
                    loading_read_retry_number=0;
                    echo('setInterval_ID='+setInterval_ID);
                    clearInterval(setInterval_ID);
                    close_loading_attention();
                    searchResultLst.onExit();
                    prevLst=currLst;
                    currLst=modalLst;
                    show_auth_request(lang_message_server_no_ansver);
                }
            }
        }, 1000)
    }
}


searchResultLst.next = function(){
    this.prevPos = this.pos;
    this.direct = 'next';
    if(this.pos < this.page_length-1 && this.pos!=vars[win.height].ext_cont_page_x_max-1 && this.page*this.page_length+this.pos+1 < video_files_total_num)
    {
        this.pos++;
        this.onChange();
    }
    else{
        this.page++;
        if(this.page*this.page_length >= video_files_total_num){
            this.page--;
            return;
        } 
        if(this.pos==this.page_length-1 && this.page*this.page_length+vars[win.height].ext_cont_page_x_max+1 < video_files_total_num-1){
            this.prevPos = vars[win.height].ext_cont_page_x_max;
            this.pos = vars[win.height].ext_cont_page_x_max;
            this.horizontal_pos=1;
        } 
        else         
        {
            this.prevPos=0;
            this.pos=0;
            this.horizontal_pos=0;
        }
        echo('nextnew this.pos = '+this.pos+' horiz_pos = '+this.horizontal_pos+' this.prevPos='+this.prevPos+' this.page='+this.page+' this.page_length='+this.page_length);
        this.direct = 'next';
        if(this.page+2<=this.number_of_pages-1)
            sendreq(megogoURL+'p/search?'+createSign({
                'text':$('search_line').value, 
                'session':session,
                'offset':(this.page+2)*this.page_length,
                'limit':vars[win.height].ext_cont_page_x_max*2,'lang':lang
            }), search_buffer, true);
            
        this.overflow();
    }
}


searchResultLst.prev = function(){
    this.direct = 'prev';
    this.prevPos = this.pos;
    if(this.pos!=0 && this.pos!=vars[win.height].ext_cont_page_x_max)
    {
        this.pos--;
        this.onChange();
    }    
    else
    {
        if(this.page!=0)
        { 
            if(this.pos==0)
            {
                this.horizontal_pos=0;
                this.pos=vars[win.height].ext_cont_page_x_max-1;
                this.page--;
            }
            else 
            {
                this.horizontal_pos=1;
                this.pos=this.page_length-1;  
                this.page--;
            }
            echo('prev this.pos = '+this.pos+' horiz_pos = '+this.horizontal_pos+' this.prevPos='+this.prevPos+' this.page='+this.page);
           this.direct = 'prev';
            if(this.page-2>=0 && this.page<this.number_of_pages-2)
                sendreq(megogoURL+'p/search?'+createSign({
                    'text':$('search_line').value, 
                    'session':session,
                    'offset':(this.page-2)*this.page_length,
                    'limit':vars[win.height].ext_cont_page_x_max*2,'lang':lang
                }), search_buffer, true);
            
            this.overflow();
        }
    }
}


searchResultLst.onUp = function(){
    if(this.horizontal_pos==1) 
    {
        this.prevPos=this.pos;
        this.pos-=vars[win.height].ext_cont_page_x_max;
        this.horizontal_pos=0;
        currLst.onChange();       
    }
}


searchResultLst.onDown = function(){
    echo('onDown');
    if(searchResultLst.page*searchResultLst.page_length+searchResultLst.pos+vars[win.height].ext_cont_page_x_max < video_files_total_num && this.horizontal_pos==0) 
    {
        this.prevPos=this.pos;
        this.pos+=vars[win.height].ext_cont_page_x_max; 
        this.horizontal_pos=1;
        currLst.onChange(); 
    }
}


searchResultLst.onExit = function(){
    $('cats_page').style.display = 'block';
    $('extsubmenu').style.display = 'none';
    $('lang_footer_return').style.display = 'none';
    $('submenu').style.display = 'none';
    $('ext_video_layer').innerHTML='';
    $('ext_video_layer_0').innerHTML='';
    request_attempt=[];
    main_video_files_list=[];
    loading_read_retry_number=0;
    searchResultLst.list_buffer=0;   
    currLst = catLst;
    $('search_line').blur(); 
    currLst.onChange();
}

// action for the "BACK" button
searchResultLst.onRefresh = function(){
    $('extsubmenu').style.display = 'none';
    $('lang_footer_return').style.display = 'none';
    $('ext_video_layer').innerHTML='';
    $('ext_video_layer_0').innerHTML='';
    request_attempt=[];
    main_video_files_list=[];
    loading_read_retry_number=0;
    searchResultLst.list_buffer=0;   
    $('modal_search1').style.display = 'block';
    $('search_modal_box').style.display='block'; 
    $("lang_footer_keyboard").style.display = "block";
    $('lang_footer_return').style.display = "none";
    CUR_LAYER=layer_search;
    currLst = searchLst;
    currLst.reset();    
}


searchResultLst.onEnter = function(){
    $('extsubmenu').style.display = 'none';
    $('info_page').style.display = 'block';
    $('footer_sort').style.display = 'none';
    this.dataset = main_video_files_list; 
    this.offset =  this.page*this.page_length+this.pos;
    switchMovieInfo(this);
    this.offset =  this.page*this.page_length+this.pos;
    
    prevLst = searchResultLst;
    currLst = movieInfoLst;

    movieInfoLst.color = colors[0]; // голубой цвет для всего поиска
    currLst.reset();
    currLst.onChange();
}
//////////////////////// searchResultLst end ///////////////////////////////////


//////////////////////////// likeLst ///////////////////////////////////////////
likeLst = new parent_lists_prototype();
likeLst.length = 2;


likeLst.reset = function(){
    likeLst.prevPos=1;
    likeLst.pos=0;
    currLst.onChange();
    $('lang_dont_like').style.display='block';
    $('lang_like').innerHTML = lang_like;
}


likeLst.onChange = function(){
    $('movieinfo_submenu').children[this.prevPos].className ="movieinfo_menuitem";
    $('movieinfo_submenu').children[this.pos].className ="movieinfo_menuitem_"+colors[catLst.pos];
}


likeLst.onEnter = function(){   // if like=0 -> you dont like it, but if like=1 -> you like it
    var like = 0;
    if(this.pos==0)
        like = 1;
    sendreq(megogoURL+'p/addvote?'+createSign({
        'video':fileInfo.id, 
        'like':like,  
        'session':session
    }), setLike);
        
    $('movieinfo_submenu').children[this.prevPos].className ="movieinfo_menuitem";
    $('movieinfo_submenu').children[this.pos].className ="movieinfo_menuitem";
    
    $('lang_dont_like').style.display='none';
    $('lang_like').innerHTML = lang_already_voted;
        
    currLst = movieInfoLst;
    currLst.onChange();
    $('movieinfo_submenu').style.display = 'none';
}


likeLst.onExit = function(){
    $('movieinfo_submenu').children[this.prevPos].className ="movieinfo_menuitem";
    $('movieinfo_submenu').children[this.pos].className ="movieinfo_menuitem";
    currLst = movieInfoLst;
    $('info_'+movieInfoLst.pos).className = 'movieinfo_menuitem_'+colors[catLst.pos];
    currLst.onChange();
    $('movieinfo_submenu').style.display = 'none';
}

likeLst.overflow = function(){
    if(this.page>0){
        this.pos =  this.prevPos;
        this.page=0;
        this.onChange();
    }
    if (this.page<0){
        this.pos =  this.prevPos;
        this.page=0;
        this.onChange();
    }
}
/////////////////////////////// likeLst  end  //////////////////////


/////////////////////////////////////  authLst  ////////////////////////////////
authLst = new parent_lists_prototype();
authLst.id = ['login', 'password']// 'modal_auth_accept_button', 'modal_auth_cancel_button'];
authLst.length = 3;
authLst.res = '';


authLst.reset = function(){
    this.pos=0;
    this.prevPos=0;
    
    var icon_arr = ['submenugenres_title login_icon','submenugenres_title passw_icon', 'submenugenres_title enter_icon'];
    if(session!='') {
        auth_submenu_array = [accpass.login, '**********', auth_btn_logout];
    }
    if(session==''){
        auth_submenu_array = ['<input type="text" id="login" value="" placeholder="'+lang_login+'"/>', '<input type="password" id="password" value="" placeholder="'+lang_password+'"/>', auth_btn_enter];
    }
    $('sub_genres_id').innerHTML='<div class="submenu_genres_item"></div>';
    for(var i=0; i<3; i++){    
        var obj = {
            'tag':'div',
            'attrs':
            {
                'class':'submenu_genres_item',
                'id': 'sub_genres_item_'+i
            },
            'child':
            [
            {
                'tag':'div',
                'attrs':
                {
                    'class':icon_arr[i],
                    'id': 'submenugenres_title_'+i,
                    'html': auth_submenu_array[i]
                }
            }
            ]
        }
        $('sub_genres_id').appendChild(createHTMLTree(obj));
    }
    $('sub_genres_item_'+this.pos).className ='submenu_genres_item_act_blue_no_arr';
    $('sub_submenu_genres').style.display = 'block';    
}


authLst.onLeft = function(){
    currLst.onExit();
}


authLst.onRight = function(){
    if(this.pos>1)
        currLst.onEnter();
}


authLst.onExit = function(){
    $('sub_submenu_genres').style.display = 'none';
    $('lang_footer_keyboard').style.display = 'none';
    currLst = settingsSubmenuLst;
    $('genres_item_'+settingsSubmenuLst.pos).className = 'submenu_genres_item_act_blue';
}


authLst.onEnter = function(res){
    if(this.pos == 2){
        if(session!=''){
            session = '';
            $('submenugenres_title_0').innerHTML = '<input type="text" id="login"  value="" placeholder="'+lang_login+'"/>', 
            $('submenugenres_title_1').innerHTML = '<input type="password" id="password" value="" placeholder="'+lang_password+'"/>';
            $('submenugenres_title_2').innerHTML = auth_btn_enter;            
            accpass.pass='';
            accpass.login ='';
            stb.SaveUserData('megogofile','{"login":"","pass":"","quality":"'+accpass.quality+'"}')
        } else {
            session = '';
            echo("login is = "+$('login').value+" pass is = "+$('password').value);
            sendreq(iviURL+'login?'+createSign({
                'login':$('login').value, 
                'pwd':$('password').value
            }),drowheader,true);
        }
    }

    if(this.pos==0){
        if(session==''){
            $(this.id[this.pos]).focus();
            stb.ShowVirtualKeyboard();
        }
    }
    
    if(this.pos==1){
        if(session==''){
            $(this.id[this.pos]).focus();
            stb.ShowVirtualKeyboard();
        }
    }
    
    currLst.onChange();
}


authLst.virtKeyb = 0;
 
 
authLst.onChange = function(){
    $('sub_genres_item_'+this.prevPos).className ='submenu_genres_item';    
    $('sub_genres_item_'+this.pos).className ='submenu_genres_item_act_blue_no_arr';
}


authLst.onRefresh = function() {}

authLst.overflow = function(){
    if(this.page>0){
        this.pos =  this.prevPos;
        this.page=0;
        this.onChange();
    }
    if (this.page<0){
        this.pos =  this.prevPos;
        this.page=0;
        this.onChange();
    }
}
///////////////////////////////////////////////////////////////////////


var _GET = {};

(function(){
    var get = new String(window.location);
    var x = get.indexOf('?');
    if (x!=-1){
        var l = get.length;
        get = get.substr(x+1, l-x);
        l = get.split('&');
        x = 0;
        for(var i in l){
            if (l.hasOwnProperty(i)){
                get = l[i].split('=');
                _GET[get[0]] = get[1];
                x++;
            }
        }
    }
})();

if (_GET.hasOwnProperty('referrer')){
    _GET['referrer'] = decodeURIComponent(_GET['referrer']);
}


///////////////////////////////  confirmExitLst  ////////////////////
confirmExitLst = new parent_lists_prototype();
confirmExitLst.id = ['conf_ok', 'conf_cancel'];
confirmExitLst.length = confirmExitLst.id.length;
confirmExitLst.pos=0;

confirmExitLst.onRight = function(res){
    this.pos=this.pos==1?0:1;
    this.onChange();
}

confirmExitLst.onLeft = function(res){
    this.pos=this.pos==1?0:1;
    this.onChange();
}

confirmExitLst.onEnter = function(res){
    back_location = decodeURIComponent(back_location);
    log(back_location)
    if (this.pos == 0)
        window.location = _GET['referrer'] || "";       // "http://freetv.infomir.com.ua/inet-services/public_html/";
    else {
        currLst = prevLst;
        $('cats_page').style.display = 'block';
        $('confirmExit').style.display = 'none';
    }
    currLst.onChange();
}

confirmExitLst.onChange = function(){
    $(this.id[this.pos]).focus();
}

confirmExitLst.onExit = function(){}


///////////////////////////////  genreLst ////////////////////////////////
genreLst = new parent_lists_prototype();
genreLst.length = genreLst.id.length;
genreLst.maxLength = 0;


genreLst.next = function(){ //down button action for submenu (genres list)
    echo("list length = "+genre_list_length+" this position = "+this.pos);
    this.prevPos = this.pos;
    this.direct = 'next';
    this.pos++;    
    if(this.pos < (genre_list_length)){
        echo("new pos++ = "+this.pos);
//        if(this.pos<(genre_list_length-4) && $("genres_item_"+(this.pos+4)).style.display == "none"){
//            $("genres_item_"+(this.pos+4)).style.display = "block";
//            $("genres_item_"+(this.pos-5)).style.display = "none";
        if(this.pos<(genre_list_length-1) && $("genres_item_"+(this.pos+1)).style.display == "none" && this.pos>7){    
            $("genres_item_"+(this.pos+1)).style.display = "block";
            $("genres_item_"+(this.pos-8)).style.display = "none";  
        }
    }
    else{
        this.pos = this.prevPos;
    }
    this.onChange();
}

genreLst.prev = function(){ //up button action for sub_menu (genres list)
    this.direct = 'prev';
    this.prevPos = this.pos;
    if(this.pos>0){
        this.pos--;
        echo("new pos-- = "+this.pos);
//        if(this.pos>3  && $("genres_item_"+(this.pos-4)).style.display == "none"){
//            $("genres_item_"+(this.pos-4)).style.display = "block";
//            $("genres_item_"+(this.pos+5)).style.display = "none"; 
          if(this.pos>0  && $("genres_item_"+(this.pos-1)).style.display == "none"){  
            $("genres_item_"+(this.pos-1)).style.display = "block";
            $("genres_item_"+(this.pos+8)).style.display = "none";  
        }
    }
    this.onChange();
}


genreLst.reset = function(){
    this.pos = this.prevPos = this.page = 0;
    $('submenu').style.display = 'none';
    this.onChange();
}


genreLst.onChange = function(){
    cat = vars.catID[catLst.pos];
    if ($('submenu_genres').style.display == 'none')
        $('submenu_genres').style.display = 'block';
    echo('this.prevPos='+this.prevPos+' this.pos='+this.pos);
    if($('genres_id').innerHTML!='<div class="submenu_genres_item"></div>'){
        $('genres_item_'+this.prevPos).className ="submenu_genres_item";
        $('genres_item_'+this.pos).className ="submenu_genres_item_act_"+colors[catLst.pos];
    }
}


genreLst.onEnter = function(){
    prevLst = currLst;
    currLst =extSubCatLst;
    $('footer_sort').style.display = 'block';
    $('lang_footer_return').style.display = 'block';
    extCatLst_reset_flag=true;
    if(vars.catID[catLst.pos]==17){
        this_is_news_cat=true;
    }
    if(this.pos!=0){
        sendreq(megogoURL+'p/videos?'+createSign({
            'category':vars.catID[catLst.pos], 
            'genre':genreList[cat][this.pos+this.page*this.maxLength]['id'], 
            'sort': sort, 
            'session':session, 
            'limit':vars[win.height].ext_cont_page_x_max*2*3,'lang':lang
        }), catalog_buffer);
    } else {
        sendreq(megogoURL+'p/videos?'+createSign({
            'category':vars.catID[catLst.pos], 
            'sort': sort, 
            'session':session, 
            'limit':vars[win.height].ext_cont_page_x_max*2*3,'lang':lang
        }), catalog_buffer);
    }
}


genreLst.onExit = function(){
    $('submenu_genres').style.display = 'none';
    $('genres_id').innerHTML = '<div class="submenu_genres_item"></div>';
    this_is_news_cat=false;
    currLst = catLst;
    $('cat_'+catLst.pos).className = 'menu_item_'+colors[catLst.pos]+'_act';
//    currLst.onChange();
}


genreLst.overflow = function(){
    $('genres_item_'+this.id[this.prevPos]).className ="submenu_genres_item";
    cat = vars.catID[catLst.pos];
    if(genreList[cat][this.pos+this.page*this.maxLength]== undefined){
        this.pos =  this.prevPos;
        if (this.page>0)
            this.page--;
        else {
            this.page=0;
            this.pos=0;
        }
    }
    initGenriesPage(cat, this.page);
    this.prevPos =  this.pos;
    currLst.onChange();
}
//////////////////////////////  genreLst END ////////////////////////////


///////////////////////////  suggestLst ///////////////////////////////
suggestLst = new parent_lists_prototype();
suggestLst.length = 9;
suggestLst.result = undefined;


suggestLst.reset = function(result){
    echo('suggestLst.reset() and CUR_LAYER = '+CUR_LAYER); 
    for(var j=0; j<5; j++ ) {$('suggest_'+j).style.display = 'none';}
        
    if($('search_line').value.length<4) {$('suggest_box').style.display= 'none'; return;}
    if(result==undefined)
        sendreq(megogoURL+'p/searchsuggest?'+createSign({
            'text':$('search_line').value,
            'session':session,'lang':lang
        }), suggestLst.reset);
    else 
    {
        echo('result is '+result);
        result = JSON.parse(result); 
        var tmp = [];
        tmp = result.suggestions;
        echo('curr layer at suggestLst.reset res>0 is '+CUR_LAYER);
        suggestLst.length = tmp.length;
        echo('suggestLst.length='+suggestLst.length);
        if(suggestLst.length!=0){
            for(var i=0; i<tmp.length; i++ )
            {
                var obj = tmp[i];
                $('suggest_'+i).style.display = 'block';
                echo('obj.suggest.length='+obj.suggest.length);
                if(obj.suggest.length>21) {
                    obj.suggest=obj.suggest.substr(0, 20);
                    echo('obj.suggest='+obj.suggest);
                    obj.suggest+='...';
                    echo('obj.suggest='+obj.suggest);
                }
                $('suggest_'+i).innerHTML = obj.suggest;
                
            }
            $('suggest_box').style.display = 'block';
            echo('redraw now suggestLst.reset this.pos='+suggestLst.pos+' suggestLst.length='+suggestLst.length);
            if(suggestLst.pos>=suggestLst.length){
                suggestLst.prevPos=suggestLst.pos;
                suggestLst.pos=suggestLst.length-1;
                $('suggest_'+suggestLst.prevPos).className = 'suggest_item';
                $('suggest_'+suggestLst.pos). className = 'suggest_item_act';
            }
        } else {
            $('suggest_box').style.display = 'none';
        }
    }    
}
    
 
suggestLst.onLeft = function(){}

suggestLst.onRight = function(){}


suggestLst.onUp = function(){
    echo('suggestLst.onUp');
    echo('this.leng ='+this.length);
    if(this.pos<this.length-1) {
        this.prevPos=this.pos;
        this.pos++;
    }
    this.onChange();
}


suggestLst.onDown = function(){
    echo('suggestLst.onDown');
    if(this.pos>0) {
        this.prevPos=this.pos;
        this.pos--;
        this.onChange();        
    }
    else this.onExit(); 
} 
  
  
suggestLst.onExit = function(){
    this.pos=0;
    this.prevPos=0;
    $('suggest_'+this.prevPos).className = 'suggest_item';
    $('search_line').focus(); 
    stb.ShowVirtualKeyboard();
    currLst = searchLst;
    currLst.onChange();
}  
  
  
suggestLst.onChange = function(){
    echo('on change'); 
    $('suggest_'+this.prevPos).className = 'suggest_item';
    $('suggest_'+this.pos). className = 'suggest_item_act';
}


suggestLst.onEnter = function(){
    var tmp_string = str_replace($('suggest_'+this.pos).innerHTML, '...', '');
    $('search_line').value = tmp_string;
    prevLst = currLst;   
    currLst = searchLst;
    echo('searchLst');
    currLst.onEnter();
}

//////////////////////////////  extSubCatLst  ///////////////////////////////
extSubCatLst = new parent_lists_prototype();

extSubCatLst.initialisated = -1;
extSubCatLst.layers = ['cats_page'];
extSubCatLst.offsetPage = extSubCatLst.page;
extSubCatLst.list = [];
extSubCatLst.offset =0 ;
extSubCatLst.layers = ['extsubmenu'] ;
extSubCatLst.houndres =0 ;
extSubCatLst.name = 'extSubCatLst';

extSubCatLst.number_of_pages=0;

extSubCatLst.page_length = vars[win.height].ext_cont_page_x_max*2;

extSubCatLst.horizontal_pos=0;
extSubCatLst.list_buffer=0;

extSubCatLst.reset = function(){
    extCatLst_reset_flag=false;
    echo('extSubCatLst.reset()');
    this.pos = 0;
    this.prevPos = 0;
    this.page = 0;
    this.horizontal_pos=0;
    $('footer_sort').style.display = 'block'; 
    $('cats_page').style.display = 'none';
    $('extsubmenu').style.display = 'block';
    this.direct = '';
    echo('(extSubCatLst.list_buffer.limit)='+extSubCatLst.list_buffer.limit);
    video_files_total_num=extSubCatLst.list_buffer.total_num; // вычисляем количество фильмов в категории
    this.number_of_pages=Math.ceil(video_files_total_num/extSubCatLst.page_length);    // количество страниц
    echo('this.number_of_pages='+this.number_of_pages);
    for(var i=0; i<this.list_buffer.video_list.length; i++){ // переносим видеоданные из ответа в общий массив видеофайлов
        main_video_files_list[i]= this.list_buffer.video_list[i];
    }
    initHorizontalList(main_video_files_list, 0, this.page_length);
    this.onChange();
}


extSubCatLst.onPageUp = function(){  
    echo('extSubCatLst.onPageUp');
    if(this.page!=0) {
        this.page--;
        
        this.direct = 'prev';
        if(this.page-2>=0 && this.page<this.number_of_pages-2)
            sendreq(megogoURL+'p/videos?'+createSign({
                'category':vars.catID[catLst.pos], 
                'genre':genreList[cat][genreLst.pos+genreLst.page*genreLst.maxLength]['id'], 
                'sort': sort, 
                'session':session, 
                'offset':(this.page-2)*this.page_length, 
                'limit':vars[win.height].ext_cont_page_x_max*2,'lang':lang
            }), catalog_buffer,true);
            
        this.overflow();
    }
}


extSubCatLst.onPageDown = function(){
    echo('extSubCatLst.onPageDown');
    this.page++;
    if(this.page*this.page_length >= video_files_total_num){
        this.page--;
    } 
    else 
    {
        this.direct = 'next';
        if(this.page+2<=this.number_of_pages-1)
            sendreq(megogoURL+'p/videos?'+createSign({
                'category':vars.catID[catLst.pos], 
                'genre':genreList[cat][genreLst.pos+genreLst.page*genreLst.maxLength]['id'], 
                'sort': sort, 
                'session':session, 
                'offset':(this.page+2)*this.page_length, 
                'limit':vars[win.height].ext_cont_page_x_max*2,'lang':lang
            }), catalog_buffer,true);
            
        this.overflow();
    }
}


extSubCatLst.overflow = function(){
    if(main_video_files_list[extSubCatLst.page*extSubCatLst.page_length]!==undefined){
        initHorizontalList(main_video_files_list, extSubCatLst.page*extSubCatLst.page_length, extSubCatLst.page_length);
        extSubCatLst.onChange();  
    }
    else {
        echo('data not ready');
        var setInterval_ID = setInterval(function() {
            echo('setInterval_ID='+setInterval_ID);
            echo('set interval main_video_files_list[this.page='+extSubCatLst.page+'*this.page_length='+extSubCatLst.page_length+']='+main_video_files_list[extSubCatLst.page*extSubCatLst.page_length]);
            if(main_video_files_list[extSubCatLst.page*extSubCatLst.page_length]!=undefined) {
                clearInterval(setInterval_ID);
                close_loading_attention();
                echo('initHorizontalList____________________________catalog_drawing');
                initHorizontalList(main_video_files_list, extSubCatLst.page*extSubCatLst.page_length, extSubCatLst.page_length);
                extSubCatLst.onChange();    
            }
            else
            {   
                show_loading_attention(lang_loading_message);
                loading_read_retry_number++;
                echo('loading_read_retry_number'+loading_read_retry_number);
                if(loading_read_retry_number>=150){       // если данные так и не пришли от сервера в течении двух с половиной минут 
                    echo('end for this request=');
                    loading_read_retry_number=0;
                    echo('setInterval_ID='+setInterval_ID);
                    clearInterval(setInterval_ID);
                    close_loading_attention();
                    extSubCatLst.onExit();
                    prevLst=currLst;
                    currLst=modalLst;
                    show_auth_request(lang_message_server_no_ansver);
                }
            
            }
        }, 1000)
    }
}


extSubCatLst.onLeft = function(){
    this.prev();
}


extSubCatLst.onRight = function(){
    this.next();
}


extSubCatLst.onChange = function(){
    if ($('extsubmenu').style.display == 'none'){
        $('extsubmenu').style.display = 'block';
        $('footer_sort').style.display = 'block';
    }
    echo('oncange new this.pos = '+this.pos+' horiz_pos = '+this.horizontal_pos+' this.prevPos='+this.prevPos+' this.page='+this.page+' this.list.length='+this.list.length);
    if(!this_is_news_cat){
        if($('ext_video_p'+this.prevPos)!=undefined){
            $('ext_video_p'+this.prevPos).children[0].className = 'stripes_cover';
        }
        if(video_files_total_num>0){
            $('ext_video_p'+this.pos).children[0].className = 'stripes_cover_act';
        }
    } else {
        if($('ext_video_p'+this.prevPos)!=undefined){
            $('ext_video_p'+this.prevPos).children[0].className = 'news_stripes_cover';
        }
        if(video_files_total_num>0){
            $('ext_video_p'+this.pos).children[0].className = 'news_stripes_cover_act';
        }
    }
    if(video_files_total_num<1){
        $('stripehorizontal_counter').innerHTML=lang_zero_genre_films_total_num;
    } else   {
        $('stripehorizontal_counter').innerHTML=(extSubCatLst.page*vars[win.height].ext_cont_page_x_max*2+extSubCatLst.pos+1)+lang_extSubCatLst_counter+video_files_total_num;
    }
}


extSubCatLst.next = function(){
    this.prevPos = this.pos;
    this.direct = 'next';
    if(this.pos < this.page_length-1 && this.pos!=vars[win.height].ext_cont_page_x_max-1 && this.page*this.page_length+this.pos+1 < video_files_total_num)
    {
        this.pos++;
        this.onChange();
    }
    else{
        this.page++;
        if(this.page*this.page_length >= video_files_total_num){
            this.page--;
            return;
        } 
        if(this.pos==this.page_length-1 && this.page*this.page_length+vars[win.height].ext_cont_page_x_max+1 < video_files_total_num-1){
            this.prevPos = vars[win.height].ext_cont_page_x_max;
            this.pos = vars[win.height].ext_cont_page_x_max;
            this.horizontal_pos=1;
        } 
        else         
        {
            this.prevPos=0;
            this.pos=0;
            this.horizontal_pos=0;
        }
        echo('nextnew this.pos = '+this.pos+' horiz_pos = '+this.horizontal_pos+' this.prevPos='+this.prevPos+' this.page='+this.page+' this.page_length='+this.page_length);

        this.direct = 'next';
        if(this.page+2<=this.number_of_pages-1)
            sendreq(megogoURL+'p/videos?'+createSign({
                'category':vars.catID[catLst.pos], 
                'genre':genreList[cat][genreLst.pos+genreLst.page*genreLst.maxLength]['id'], 
                'sort': sort, 
                'session':session, 
                'offset':(this.page+2)*this.page_length, 
                'limit':vars[win.height].ext_cont_page_x_max*2,'lang':lang
            }), catalog_buffer,true);
            
        this.overflow();
    }
}


extSubCatLst.prev = function(){
    this.direct = 'prev';
    this.prevPos = this.pos;
    if(this.pos!=0 && this.pos!=vars[win.height].ext_cont_page_x_max)
    {
        this.pos--;
        this.onChange();
    }    
    else
    {
        if(this.page!=0)
        { 
            if(this.pos==0)
            {
                this.horizontal_pos=0;
                this.pos=vars[win.height].ext_cont_page_x_max-1;
                this.page--;
            }
            else 
            {
                this.horizontal_pos=1;
                this.pos=this.page_length-1;  
                this.page--;
            }
            echo('prev this.pos = '+this.pos+' horiz_pos = '+this.horizontal_pos+' this.prevPos='+this.prevPos+' this.page='+this.page+' this.list.length='+this.list.length);
        
            this.direct = 'prev';
            if(this.page-2>=0 && this.page<this.number_of_pages-2)
                sendreq(megogoURL+'p/videos?'+createSign({
                    'category':vars.catID[catLst.pos], 
                    'genre':genreList[cat][genreLst.pos+genreLst.page*genreLst.maxLength]['id'], 
                    'sort': sort, 
                    'session':session, 
                    'offset':(this.page-2)*this.page_length, 
                    'limit':vars[win.height].ext_cont_page_x_max*2,'lang':lang
                }), catalog_buffer,true);
            
            this.overflow();
        }
    }
}


extSubCatLst.onUp = function(){
    if(this.horizontal_pos==1) 
    {
        this.prevPos=this.pos;
        this.pos-=vars[win.height].ext_cont_page_x_max;
        this.horizontal_pos=0;
        currLst.onChange();       
    }
}


extSubCatLst.onDown = function(){
    echo('onDown');
    if(extSubCatLst.page*extSubCatLst.page_length+extSubCatLst.pos+vars[win.height].ext_cont_page_x_max < video_files_total_num && this.horizontal_pos==0) 
    {
        this.prevPos=this.pos;
        this.pos+=vars[win.height].ext_cont_page_x_max; 
        this.horizontal_pos=1;
        currLst.onChange(); 
    }
}


extSubCatLst.onExit = function(){
    $('footer_sort').style.display = 'none';
    $('cats_page').style.display = 'block';
    $('extsubmenu').style.display = 'none';
    $('lang_footer_return').style.display = 'none';
    $('ext_video_layer').innerHTML='';
    $('ext_video_layer_0').innerHTML='';
    $('submenu').style.display = 'none';
    main_video_files_list=[];
    loading_read_retry_number=0;
    request_attempt=[];
    currLst = genreLst;
    currLst.onChange();
    extSubCatLst.list_buffer=0;
}


extSubCatLst.onEnter = function(){
    $('extsubmenu').style.display = 'none';
    $('info_page').style.display = 'block';
    $('footer_sort').style.display = 'none';
    this.dataset = main_video_files_list; 
    this.offset =  this.page*this.page_length+this.pos;
    switchMovieInfo(this);
    this.offset =  this.page*this.page_length+this.pos;
    prevLst = extSubCatLst;
    currLst = movieInfoLst;

    movieInfoLst.color = colors[catLst.pos];
    currLst.reset();
    currLst.onChange();
}


///////////////////////////// modal   ///////////////////
modalLst = new parent_lists_prototype();
modalLst.refreshPage = function(){}
modalLst.next = function(){}
modalLst.prev = function(){}
modalLst.reset = function(){}
modalLst.overflow = function(){}
modalLst.onChange = function(){}

modalLst.onEnter = function(){
    currLst=prevLst;
    echo('modalLst.onEnter()');
    close_auth_attention();
}