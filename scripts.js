const searchInput=document.getElementById("search-input");
const apiKey="AIzaSyCXLPLx5gSeowM275ycEccWLY64-Y9cLf8";
localStorage.setItem("api_key", apiKey);


function searchVideos(){
    let searchValue=searchInput.value;
    let wipe=document.getElementById("newcontainer");
    wipe.innerHTML="";

    fetchVideos(searchValue);
}

async function fetchVideos(searchValue){

    try{
        let response=await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${searchValue}&key=${apiKey}`);
        let result=await response.json();
        
        console.log(result);
        for(let i = 0 ; i < result.items.length; i++) {
            let video = result.items[i] ;
            let videoStats = await fetchStats(video.id.videoId)
            if(videoStats.items.length > 0)
                result.items[i].videoStats = videoStats.items[0].statistics; 
                result.items[i].duration = videoStats.items[0] && videoStats.items[0].contentDetails.duration
        }
        
        showThumbnails(result.items);

    }catch(error){
        console.log(error)
    }
}



function showThumbnails(items){

    items.forEach((element)=>{
        let imageUrl=element.snippet.thumbnails.high.url;
        let imageElement=document.createElement("img");
        imageElement.src=imageUrl;
        imageElement.height=200;
        imageElement.width=200;
        imageElement.className="card-img-top";

        let timediv=document.createElement("div");
        timediv.innerText=element.duration ? formatDuration(element.duration):"NA";
        timediv.className="time-container";

        let div1=document.createElement("div");
        div1.className="col";
        div1.style.border="none";
        
        let div2=document.createElement("div");
        div2.className="card";

        let div3=document.createElement("div");
        div3.className="card-body";

        let h5=document.createElement("h5");
        h5.className="card-title";
        h5.innerText=element.snippet.title;
        h5.style.color="white";

        let para1=document.createElement("p");
        para1.className="card-text";
        para1.innerText=element.snippet.channelTitle;
        
        let para2=document.createElement("p");
        para2.className="card-text";
        para2.innerText=element.videoStats ? getViews(element.videoStats.viewCount)+" Views": "NA";

        div3.append(h5);
        div3.append(para1);
        div3.append(para2);

        div2.append(imageElement);
        div2.append(timediv);
        div2.append(div3);

        div1.append(div2);

        let id=document.getElementById("newcontainer");
        id.append(div1);

        div1.addEventListener('click',()=>{
            navigateToVideo(element);
        })

    });
}

// 'https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=Dgn1ePtMMSA&key=[YOUR_API_KEY]'

async function fetchStats(videoId){

    let response=await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoId}&key=${apiKey}`);
    let result=await response.json();
   // console.log(result);
    return result;
}

function getViews(views){

    if(views < 1000) return views ;
    else if ( views >= 1000 && views <= 999999){
        views /= 1000;
        views = parseInt(views)
        return views+"K" ;
    }
    return parseInt(views / 1000000) + "M" ;

}


function formatDuration(duration) {
    if (duration === "P0D") {
        return "NA";
      }
    let match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
    let hours = parseInt(match[1]) || 0;
    let minutes = parseInt(match[2]) || 0;
    let seconds = parseInt(match[3]) || 0;
  
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }


  function navigateToVideo(element){
    let videoId=element.id.videoId;
    if(videoId){
        localStorage.setItem("channel_id",element.snippet.channelId);
        document.cookie = `video_id=${videoId}; path="/video.html"`;
        let linkItem = document.createElement("a");
        linkItem.href = "http://127.0.0.1:5500/video.html"
        linkItem.target = "_blank" ;
        linkItem.click();
    }else{
        window.alert("Video is private");
    }
  }