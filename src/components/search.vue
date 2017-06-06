<template lang="html">
  <transition name="move">
    <div class="search" v-show="showFlag">
      <div class="search-box">
        <span class="back" @click="hide"></span>
        <input type="text" v-model="name" ref="name" class="search-text" placeholder="搜索音乐">
        <span @click="search(1)" class="search-btn"></span>
      </div>
      <!--<p>music name is : {{name}}</p>-->
      <div ref="songWrap" class="songWrap">
        <ul class="songList">
          <li v-for="(song, index) in songs" class="songItem" >
            <p class="songName">{{song.name}}</p>
            <p class="singer">{{song.ar[0].name}}-{{song.al.name}}</p>
            <span class="songPlay" :class="{'pause':pauseIndex == index}" @click.prevent="listPlay(song,index,$event)"></span>
          </li>
          <li class="load-more" @click.prevent="loadmore($event)">{{msg}}</li>
        </ul>
      </div>
    </div>
  </transition>
</template>
<script>
  import axios from 'axios';
  import Bscroll from 'better-scroll';
    export default{
        data(){
            return{
                showFlag:false,
                name:"",
                songs:[],
                pauseIndex:-1,
                offset:1,
                msg:"加载更多",
                state:1
            }
        },
        methods:{
            show(){
                this.showFlag = true;
            },
            hide(){
                this.showFlag = false;
            },
            search(from){
            //alert("click");
            //http://s.music.163.com/search/get/?type=1&limit=1&s=
            var name = this.name;
            console.log(from);
            if(from){
              this.offset = 1;
            }

            var offset = this.offset;
            console.log(name);
            axios.get('https://api.imjad.cn/cloudmusic/?type=search&limit=20&s='+name+'&offset='+offset)
              .then( (response) => {
                //console.log(response.data);
                var music = JSON.parse(JSON.stringify(response.data));
                var result = music.result;
                //var songs = result.songs;
                if(offset == 1){
                  this.songs = result.songs;
                }else {
                  this.songs = this.songs.concat(result.songs);
                }

                this.pauseIndex = -1;
                console.log(this.songs[0].id);
                //console.log("initscroll" + this.initScroll());
                if(offset == 1){
                  this.$nextTick(() => {
                    console.log("nextTick");
                    console.log(this.songs);
                    this.initScroll();
                  })
                }else {
                    this.$nextTick(() => {
                        this.scroll.refresh();
                    })
                }

                this.offset++;
              })
              .catch(function (error) {
                console.log(error);
              });
          },
            initScroll(){
                var self = this;
                console.log("Bscroll is ok");
                this.scroll =  new Bscroll(this.$refs.songWrap,{
                    click:true
                });
                this.scroll.on('touchend',function (position) {
                  //console.log("position:"+position.y);
                  //console.log("maxScrollY:"+this.maxScrollY);
                  //self.msg = "加载中";
                  if(position.y<this.maxScrollY){
                      console.log("加载中");
                    self.search(0);


                  }
                });
            },
            loadmore(event){
              if(!event._constructed){
                return;
              }
              this.search(0);
            },
            listPlay(song,index,event){
              if(!event._constructed){
                return;
              }
                console.log(song.id);
                console.log("this.state:"+this.state);
                var songs = this.songs;
                this.pauseIndex = index;
                if(this.state){
                  this.$emit('search',song,index,songs);
                  this.state = 0;
                }
                setTimeout(()=> {
                  this.state = 1;
                },1000);

            }
        }
    }
</script>
<style scoped>
  p{
    margin: 0px;
    padding: 0px;
  }
  .search{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 2000px;
    z-index: 30;
    background-color: #fff;
    -webkit-transform: translate3d(0,0,0);
    transform: translate3d(0,0,0);
  }
  .search.move-enter-active , .search.move-leave-active{
    -webkit-transition: all 0.2s linear;
    transition: all 0.2s linear;
  }
  .search.move-enter , .search.move-leave-active{
    -webkit-transform: translate3d(100%,0,0);
    transform: translate3d(100%,0,0);
  }
  .back{
    background: url("../assets/back.png");
    width: 64px;
    height: 64px;
    position: fixed;
    left: 20px;
    top: 25px;
  }
  .search-btn{
    background: url("../assets/search2.png");
    width: 64px;
    height: 64px;
    position: fixed;
    right: 20px;
    top: 25px;
  }
  .search-box{
    width: 100%;
    height: 104px;
    background-color: #ff0d49;
  }
  .search-text{
    width: 80%;
    margin-top: 20px;
    line-height: 64px;
    height: 64px;
    font-size: 40px;
    text-indent: 5px;
    background-color: #ff0d49;
    color: #fff;
    border: none;
    border-bottom: 1px solid #fff;
    -webkit-appearance: none;
    border-radius: 0;

  }
  ::-webkit-input-placeholder{
    color: #fff;
    opacity: 0.7;
  }
  .songWrap{
    overflow: hidden;
    position: absolute;
    top: 110px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background-color: rgba(205,205,205,0.2);
  }
  .songList{
    padding:  0px 20px;
  }
  .songItem{
    position: relative;
    width: 100%;
    list-style-type: none;
    height: 100px;
    padding: 20px 0px;
    border-bottom: 1px solid rgba(181,181,181,0.5);
  }
  .songName{
    font-size: 30px;
    text-align: left;
    font-family: "Microsoft YaHei UI";
    margin-top: 15px;
    margin-bottom: 10px;
  }
  .singer{
    font-size: 18px;
    text-align: left;
    color: #9da0a6;
    margin-top: 0px;
  }
  .songPlay{
    position: absolute;
    top: 0px;
    right: 0px;
    width: 144px;
    height: 144px;
    background: url("../assets/play.png");
    transform: scale(0.5);
  }
  .pause{
    position: absolute;
    top: 0px;
    right: 0px;
    width: 144px;
    height: 144px;
    background: url("../assets/pause.png") no-repeat;
    transform: scale(0.5);
  }
  .load-more{
    font-size: 25px;
    list-style-type: none;
  }
  @media screen and (min-width: 1000px){
    .search{
      position: absolute;
      right: 10px;
      width: 55%;
      height: 80vh;
      margin: 35px 0 0 40%;
      border-radius: 15px;
      box-shadow: 0px 6px 7px #999;
    }
    .search-box{
      height: 60px;
      border-radius: 15px 15px 0 0;
    }
    .search-text{
      margin-top: 10px;
      height: 35px;
      line-height: 35px;
      font-size: 15px;
    }
    .songItem{
      height: 40px;
      margin:  5px 0px;
      padding: 2px 0px;
    }
    .songName{
      font-size: 14px;
      margin-top: 0;
      margin-bottom: 0px;
    }
    .singer{
      font-size: 12px;
    }
    .songPlay{
      top: -5px;
      width: 52px;
      height: 52px;
      background-size: cover;
      cursor: pointer;
    }
    .pause{
      top: -5px;
      bottom: 5px;
      width: 52px;
      height: 52px;
      background-size: cover;
    }
    .back{
      /*display: none;*/
      top: 18px;
      width: 30px;
      height: 30px;
      background-size: cover;
      cursor: pointer;
    }
    .search-btn{
      top: 15px;
      width: 26px;
      height: 26px;
      background-size: cover;
      cursor: pointer;
    }
    .songWrap{
      top: 65px;
    }
    .load-more{
      height: 20px;
      line-height: 20px;
      font-size: 15px;
      cursor: pointer;
    }
  }
</style>
