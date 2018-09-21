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
               @touchend="touchend" @mousedown="touchdown" @mousemove="touchmove" @mouseup="touchend">
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
      <search ref="goSearch" @search="search"></search>
    </div>
</template>
<script>
import axios from 'axios'
import search from './search'
export default{
  data () {
    return {
      name: '',
      message: '',
      songs: Object,
      songsList: [],
      songUrl: '',
      startTime: '00:00',
      time: '05:28',
      state: 0,
      index: 0,
      originPos: {
        x: 0,
        y: 0
      },
      curProcess: 0,
      mouseFlag: false,
      autoState: 1
    }
  },
  methods: {
    search (song, index, songs) {
      var self = this
      this.songs = song
      this.index = index
      this.songsList = songs
      console.log('传过来的song:' + song + song.name + song.ar[0].name + song.al.picUrl)
      console.log('传过来的id：' + song.id)
      console.log('传过来的index:' + index)
      console.log('传过来的songs:' + songs.length)
      axios.get('https://api.imjad.cn/cloudmusic/?id=' + song.id)
        .then((response) => {
          var songItem = JSON.parse(JSON.stringify(response.data))
          var url = songItem.data[0].url
          console.log(url)
          this.songUrl = url
          setTimeout(function () {
            var time = document.getElementById('audio').duration
            console.log(time)
            self.currentTime(time, 0)
            self.play()
          }, 500)
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    play () {
      var audio = document.getElementById('audio')
      if (audio.paused) {
        audio.play()
        console.log('点击播放按钮了')
        this.state = 1
      } else {
        audio.pause()
        this.state = 0
        console.log('点击暂停按钮了')
      }
    },
    preplay () {
      this.index--
      this.switchplay(this.index)
    },
    nextplay () {
      this.index++
      this.switchplay(this.index)
    },
    switchplay (index) {
      var self = this
      this.songs = this.songsList[index]
      axios.get('https://api.imjad.cn/cloudmusic/?id=' + this.songsList[index].id)
        .then((response) => {
          var songItem = JSON.parse(JSON.stringify(response.data))
          var url = songItem.data[0].url
          console.log(url)
          this.songUrl = url
          setTimeout(function () {
            var audio = document.getElementById('audio')
            audio.addEventListener('canplay', function () {
              var time = audio.duration
              console.log('canplay')
              self.currentTime(time, 0)
            })
            self.play()
          }, 500)
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    timeline () {
      var audio = document.getElementById('audio')
      var scales = audio.currentTime / audio.duration
      this.$refs.line.style.width = this.$refs.progress.offsetWidth * scales + 'px'
      this.$refs.lineSlider.style.left = this.$refs.progress.offsetWidth * scales + 'px'
      console.log(audio.currentTime)
      this.currentTime(audio.currentTime, 1)
      if (scales === 1 && this.autoState) {
        this.state = 0
        this.autoState = 0
        this.nextplay()
      }
      setTimeout(() => {
        this.autoState = 1
      }, 1000)
    },
    currentTime (time, state) {
      let minute
      let second
      time = Math.round(time)
      console.log(time)
      minute = Math.floor(time / 60)
      second = time - minute * 60
      console.log('0' + minute + ':' + second)
      if (state) {
        if (second < 10) {
          this.startTime = '0' + minute + ':0' + second
        } else {
          this.startTime = '0' + minute + ':' + second
        }
      } else {
        if (second < 10) {
          this.time = '0' + minute + ':0' + second
        } else {
          this.time = '0' + minute + ':' + second
        }
      }
    },
    touchdown () {
      this.mouseFlag = true
      var touch
      if (event.touches) {
        touch = event.touches[0]
      } else {
        touch = event
      }
      this.originPos.x = touch.clientX
      this.originPos.y = touch.clientY
      console.log('curX:' + this.originPos.x + ',curY:' + this.originPos.x)
    },
    touchmove () {
      if (this.mouseFlag) {
        var touch
        if (event.touches) {
          touch = event.touches[0]
        } else {
          touch = event
        }
        var curleft = touch.clientX - this.$refs.progress.offsetLeft - this.$refs.progressBar.offsetLeft
        console.log('progress:' + this.$refs.progress.clientLeft)
        if (curleft > 0 && curleft < 650) {
          this.curProcess = curleft
          this.$refs.lineSlider.style.left = curleft + 'px'
        }
        // 阻止页面的滑动默认事件
        document.addEventListener('touchmove', function () {
          event.preventDefault()
        }, false)
      }
    },
    touchend () {
      this.mouseFlag = false
      var audio = document.getElementById('audio')
      var scales = this.curProcess / this.$refs.progress.offsetWidth
      console.log('scales:' + scales)
      audio.currentTime = audio.duration * scales
      if (!audio.paused) {
        audio.play()
      }
    },
    goSearch () {
      console.log('goSearch>>')
      this.$refs.goSearch.show()
    }
  },
  computed: {
  },
  created () {
    axios.get('https://api.imjad.cn/cloudmusic/?type=search&limit=1&s=成都')
      .then((response) => {
        var music = JSON.parse(JSON.stringify(response.data))
        var result = music.result
        this.songs = result.songs[0]
        console.log(this.songs.id)
        var id = this.songs.id
        axios.get('https://api.imjad.cn/cloudmusic/?id=' + id)
          .then((response) => {
            var songItem = JSON.parse(JSON.stringify(response.data))
            var url = songItem.data[0].url
            console.log(url)
            this.songUrl = url
            setTimeout(function () {
              var time = document.getElementById('audio').duration
              console.log(time)
              this.time = time
            }, 500)
          })
          .catch(function (error) {
            console.log(error)
          })
      })
      .catch(function (error) {
        console.log(error)
      })
  },
  mounted () {
    console.log('ready')
  },
  components: {
    search
  }
}
</script>
<style scoped>
  .musicbox{
    width:100%;
  }
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
  @keyframes rotation{
    from {transform: rotate(0deg);}
    to {transform: rotate(360deg);}
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
  @media screen and (min-width: 1000px){
    *{
      font-size: 12px;
    }
    html{
      background: #d2d5d6;
    }
    #musicbox{
      margin-top: -25px;
      margin-left: 20px;
      width: 27vw;
      height:45vw;
      background-color: #fff;
      border-radius: 15px;
      box-shadow: 0px 6px 7px #999;
    }
    .bg img{
      display: none;
    }
    .avatar{
      margin-top: 3vw;
      width: 18vw;
      height: 18vw;
      border: 4px solid #fff;
      box-shadow: 0 0 25px 10px rgba(0,106,255,0.15);
    }
    .song-name{
      font-size: 15px;
    }
    .singer{
      font-size: 12px;
    }
    .progress-line{
      width: 90%;
    }
    .time{
      font-size: 12px;
    }
    .control-bar{
      height: 8vw;
    }
    .progress-bar{
      height: 40px;
    }
    .start-time{
      top: 12px;
      left: -26px;
    }
    .end-time{
      position: absolute;
      right: -26px;
      top: 12px;
    }
    .loop-btn{
      cursor: pointer;
      width: 3vw;
      height: 3vw;
      background-size: 2vw 2vw;
      margin: -1vw 0.7vw 0 0;
    }
    .pre-btn{
      cursor: pointer;
      width: 2.5vw;
      height: 1.5vw;
      background-size: 2.3vw 1.3vw;
      margin: 0 0 1vw 0;
    }
    .pause-btn{
      cursor: pointer;
      width: 3vw;
      height: 3vw;
      background-size: cover;
      margin: 0 1vw;
    }
    .next-btn{
      cursor: pointer;
      width: 2.5vw;
      height: 1.5vw;
      background-size: 2.3vw 1.3vw;
      margin: 0 0 1vw 0;
    }
    .volume-btn{
      cursor: pointer;
      width: 3vw;
      height: 3vw;
      background-size: 2vw 2vw;
      margin: 1vw 0 0 1vw;
    }
    .goSearch{
      /*display: none;*/
      width: 3vw;
      height: 3vw;
      background-size: cover;
      cursor: pointer;
    }
  }
</style>
