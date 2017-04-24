<template lang="html">
    <div id="musicbox">
      <span @click="goSearch" class="goSearch"></span>
      <audio :src="songUrl" id="audio" @timeupdate="timeline"></audio>
      <img :src="songs.al.picUrl" width="640" height="640" class="avatar" :class="{'avatar-rotate':state>0}">
      <p class="song-name">{{songs.name}}</p>
      <p class="singer">{{songs.ar[0].name}}</p>
      <div class="progress-bar" ref="progressBar">
        <span class="time start-time">{{startTime}}</span>
        <div class="progress-line" ref="progress">
          <span class="line" ref="line"></span>
          <div class="line-slider" ref="lineSlider" @touchstart="touchdown" @touchmove="touchmove"
               @touchend="touchend">
            <span class="line-slider-box" ></span>
          </div>
        </div>
        <span class="time end-time">{{time}}</span>
      </div>
      <div class="control-bar" >
        <div class="loop-btn btn" ></div>
        <div class="pre-btn btn" @click="preplay"></div>
        <div class="pause-btn btn" :class="{'pause':state>0}" @click="play"></div>
        <div class="next-btn btn" @click="nextplay"></div>
        <div class="volume-btn btn"></div>
      </div>
      <div class="bg">
        <img src="../assets/bg.png">
      </div>
      <!--<div class="hide" style="display: none">-->
        <!--<P>hello musicbox!!!!!</P>-->
        <!--<input type="text" v-model="name" ref="name">-->
        <!--<p>music name is : {{name}}</p>-->
        <!--<button @click="search">搜索</button>-->
        <!--<button @click="play">播放</button>-->
        <!--<ul>-->
          <!--<li v-for="song in songs">{{song.id}}</li>-->
        <!--</ul>-->
        <!--<input v-model="message" placeholder="edit me">-->
        <!--<p>Message is: {{ message }}</p>-->
      <!--</div>-->
      <search ref="goSearch" @search="search"></search>
    </div>
</template>
<script>
  import axios from 'axios';
  import search from './search';

    export default{
      data(){
          return{
              name:"",
              message:"",
              songs:Object,
              songsList:[],
              songUrl:"",
              startTime:"00:00",
              time:"05:28",
              state:0,
              index:0,
              originPos:{
                  x:0,
                  y:0
              },
              curProcess:0
          }
      },
      methods:{
          search(song,index,songs){
            var self = this;
            this.songs = song;
            this.index = index;
            this.songsList = songs;
            console.log("传过来的song:"+song+song.name+song.ar[0].name+song.al.picUrl);
            console.log("传过来的id："+song.id);
            console.log("传过来的index:"+index);
            console.log("传过来的songs:"+songs.length);
            axios.get('https://api.imjad.cn/cloudmusic/?id='+song.id)
              .then( (response) => {
                var songItem = JSON.parse(JSON.stringify(response.data));
                var url = songItem.data[0].url;
                console.log(url);
                this.songUrl = url;
                setTimeout(function () {
                  var time = document.getElementById("audio").duration;
                  //this.methods.controlBar(time);
                  console.log(time);
                  self.currentTime(time,0);
//                  var audio = document.getElementById("audio");
//                  audio.play();
                  self.play();
                },500);
              })
              .catch(function (error) {
                console.log(error);
              });

              //alert("click");
              //http://s.music.163.com/search/get/?type=1&limit=1&s=
//            var name = this.name;
//            console.log(name);
//              axios.get('https://api.imjad.cn/cloudmusic/?type=search&limit=10&s='+name)
//                .then( (response) => {
//                    //console.log(response.data);
//                    var music = JSON.parse(JSON.stringify(response.data));
//                    var result = music.result;
//                    //var songs = result.songs;
//                    this.songs = result.songs;
//                    console.log(this.songs[0].id);
//
//                })
//                .catch(function (error) {
//                    console.log(error);
//                });
          },
          play(){
            var audio = document.getElementById("audio");
            var progress = document.getElementById("progress-line");
            var line = document.getElementById("line");
            //var pause_btn = document.getElementById("pause-btn");
//            audio.addEventListener("timeupdate",function () {
//              console.log("test");
//              var scales = audio.currentTime/audio.duration;
//              line.style.width = progress.offsetWidth * scales +'px';
//            });
            if(audio.paused){
                audio.play();
                //this.style.background="url(../assets/pause.png) no-repeat"
                console.log("点击播放按钮了");
                this.state = 1;
            }else {
                audio.pause();
                //this.style.background="url(../assets/play.png) no-repeat"
                this.state = 0;
                console.log("点击暂停按钮了");
            }
          },
          preplay(){
            this.index--;
            this.switchplay(this.index);
          },
          nextplay(){
            this.index++;
            this.switchplay(this.index);
          },
          switchplay(index){
              //this.index++;
              //var index = this.index;
              var self = this;
              this.songs = this.songsList[index];
              axios.get('https://api.imjad.cn/cloudmusic/?id='+this.songsList[index].id)
                .then( (response) => {
                  var songItem = JSON.parse(JSON.stringify(response.data));
                  var url = songItem.data[0].url;
                  console.log(url);
                  this.songUrl = url;
                  setTimeout(function () {
                    var audio = document.getElementById("audio");

                    audio.addEventListener('canplay',function () {
                      var time = audio.duration;
                      console.log("canplay");
                      self.currentTime(time,0);
                    })
                    //this.methods.controlBar(time);
                    console.log(time);

//                  var audio = document.getElementById("audio");
//                  audio.play();
                    self.play();
                  },500);
                })
                .catch(function (error) {
                  console.log(error);
                });
          },
          timeline(){
            var audio = document.getElementById("audio");
            var scales = audio.currentTime/audio.duration;
            //console.log(this.$refs.progress.offsetWidth);
            this.$refs.line.style.width = this.$refs.progress.offsetWidth * scales +'px';
            this.$refs.lineSlider.style.left = this.$refs.progress.offsetWidth * scales  +'px';
              //console.log(el);
             console.log(audio.currentTime);
             //console.log(audio.duration);
             this.currentTime(audio.currentTime,1);
             if(scales==1){
                 this.state = 0;
                 this.index++;
                 this.switchplay(this.index);
             }
          },
          currentTime(time,state){
            let minute;
            let second;
            time = Math.round(time);
            console.log(time);
            minute = Math.floor(time/60);
            second = time - minute*60;
            console.log("0"+minute+":"+second);
            if(state){
              if(second<10){
                this.startTime="0"+minute+":0"+second;
              }else {
                this.startTime="0"+minute+":"+second;
              }
            }else {
              if(second<10){
                this.time="0"+minute+":0"+second;
              }else {
                this.time="0"+minute+":"+second;
              }
            }


          },
          touchdown(){
            this.originPos.x = event.touches[0].clientX;
            this.originPos.y = event.touches[0].clientY;
            console.log("curX:"+this.originPos.x+",curY:"+this.originPos.x);
          },
          touchmove(){
            var curleft = event.touches[0].clientX - this.$refs.progress.offsetLeft-this.$refs.progressBar.offsetLeft;
            console.log("progress:"+this.$refs.progress.clientLeft);
            //var curleft = this.$refs.lineSlider.style.left.toString();
            console.log("left:"+curleft);
            console.log(event.touches[0].clientX,event.touches[0].clientY);
            if(curleft>0 && curleft<650){
              this.curProcess  = curleft;
              this.$refs.lineSlider.style.left = curleft + 'px';
            }
            //阻止页面的滑动默认事件
            document.addEventListener("touchmove",function(){
              event.preventDefault();
            },false);
          },
          touchend(){
              var audio = document.getElementById("audio");
              var scales = this.curProcess / this.$refs.progress.offsetWidth ;
              console.log("scales:"+scales);
              audio.currentTime = audio.duration * scales;
              if(!audio.paused)
                  audio.play();

          },
          goSearch(){
              console.log("goSearch>>")
              this.$refs.goSearch.show();
          }
      },
      computed:{

      },
      created(){
        axios.get('https://api.imjad.cn/cloudmusic/?type=search&limit=1&s=成都')
          .then( (response) => {
            //console.log(response.data);
            var music = JSON.parse(JSON.stringify(response.data));
            var result = music.result;
            //var songs = result.songs;
            this.songs = result.songs[0];
            console.log(this.songs.id);
            var id = this.songs.id;
            axios.get('https://api.imjad.cn/cloudmusic/?id='+id)
              .then( (response) => {
                var songItem = JSON.parse(JSON.stringify(response.data));
                var url = songItem.data[0].url;
                console.log(url);
                this.songUrl = url;
                setTimeout(function () {
                  var time = document.getElementById("audio").duration;
                  //this.methods.controlBar(time);
                  console.log(time);
                  this.time = time;
                },500);

              })
              .catch(function (error) {
                console.log(error);
              });
          })
          .catch(function (error) {
            console.log(error);
          });


      },
      mounted(){
        console.log("ready");
//        this.$nextTick( function () {
//          var audio = document.getElementById("audio");
//          audio.addEventListener("timeupdate",function () {
//            console.log("test");
//          });
//        })

      },
      components:{
          search
      }
    }
</script>
<style scoped>
  .goSearch{
    background: url("../assets/search.png") no-repeat;
    width: 64px;
    height: 64px;
    position: absolute;
    top: 30px;
    right: 20px;
  }
  .avatar{
    margin-bottom: 45px;
    border-radius: 50%;
    border: 8px solid #fff;
    box-shadow: 0 0 50px 20px rgba(0,106,255,0.15);
  }
  .avatar-rotate{
    transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    animation:rotaion 18s linear infinite;
    -webkit-animation: rotation 18s linear infinite;
  }
  @-webkit-keyframes rotation{
    from {-webkit-transform: rotate(0deg);}
    to {-webkit-transform: rotate(360deg);}
  }
  .song-name{
    margin-top: 0px;
    margin-bottom: 20px;
    font-size: 66px;
    font-family: "Microsoft YaHei UI";
    color: #3d3e40;
  }
  .singer{
    margin-top: 0px;
    font-size: 45px;
    font-family: "Microsoft YaHei UI";
    color: #9da0a6;
  }
  .progress-bar{
    position: relative;
    margin: 0px 45px;
    height: 80px;
  }
  .progress-line{
    position: relative;
    top: 18px;
    width: 650px;
    height: 6px;
    background-color: #f2f2f2;
    margin: 0px auto;
  }
  .progress-line .line{
    position: absolute;
    top: 0px;
    left: 0px;
    display: inline-block;
    width: 0px;
    height: 6px;
    background-color: #ff0d49;
  }
  .line-slider{
    display: inline-block;
    position: absolute;
    top: -5px;
    left: 0px;
    width: 50px;
    height: 50px;
  }
  .line-slider-box{
    display: inline-block;
    margin-left: -42px;
    width: 4px;
    height: 16px;
    border: none;
    background-color: #ff0d49;
  }
  .time{
    font-size: 36px;
    font-family: "Microsoft YaHei UI";
    color: #9da0a6;
  }
  .start-time{
    position: absolute;
    left: 0px;
  }
  .end-time{
    position: absolute;
    right: 0px;
    top: 0px;
  }
  .control-bar{
    height: 188px;
  }
  .btn{
    display: inline-block;
    line-height: 144px;
  }
  .loop-btn{
    background: url("../assets/loop.png") no-repeat;
    width: 66px;
    height: 66px;
    margin-bottom: 61px;
  }
  .pre-btn{
    background: url("../assets/pre.png") no-repeat;
    width: 76px;
    height: 46px;
    margin-left: 90px;
    margin-bottom: 74px;
    vertical-align: center;
  }
  .pause-btn{
    background: url("../assets/play.png") no-repeat;
    width: 144px;
    height: 144px;
    margin: 20px 80px;
  }
  .pause{
    background: url("../assets/pause.png") no-repeat;
  }
  .next-btn{
    background: url("../assets/next.png") no-repeat;
    width: 66px;
    height: 39px;
    margin-right: 90px;
    margin-bottom: 74px;
    vertical-align: center;
  }
  .volume-btn{
    background: url("../assets/volume.png") no-repeat;
    width: 66px;
    height: 66px;
    margin-bottom: 61px;
  }
  .bg{
    z-index: -100;
    margin-bottom: -2px;
    position: absolute;
    left: 0px;
    bottom: 0px;
  }
  .bg img{
    width: 100%;
  }
</style>
