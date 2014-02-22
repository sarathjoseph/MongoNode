function search(pageindex) {
   // var ip="http://74.74.170.219:5555";
    var ip="http://localhost:4444";
    var results = document.getElementById("results");
    var result = document.getElementById("result");
    var page = document.getElementById("page");
    var term = document.getElementById("search").value;

    if (pageindex === 1) {
        sessionStorage.user = "temp" + makeid();

        var url = ip+ "/search/" + term + "/" + sessionStorage.user + "/history/" + sessionStorage.history;
        sessionStorage.history = sessionStorage.user;
    } else
        var url = ip+ "/search/" + term + "/" + pageindex + "/" + sessionStorage.user;
    
    if (pageindex < 11)
        var pagecount = 1;
    else
        pagecount = pageindex - 5;

    function display() {


        page.innerHTML = '';
        results.innerHTML = '';
        result.innerHTML = "Fetching data ...";

        if (term.length < 2) {
            result.innerHTML = "<font color='red'>Query too short</font>";
            results.innerHTML = "";
            return;

        }

        var xmlhttp = getXMLHttpRequestObject();
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function () {

            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var posts = JSON.parse(xmlhttp.responseText);
                if (typeof posts[0] === 'object')
                    var count = posts[0].count;
                else
                    count = 0;
                result.innerHTML = "<b>" + count + " result(s) found </b> <br/>";
                for (j = 0; j < posts.length; j++) {
                    textnode = "<img src='" + posts[j].profileImageUrl + "' style='float:left;padding: 5px 5px 5px 5px;' onerror='this.src=&quot;images/denied.jpg&quot;'/>" + "<p class='user'>" + "<a href='http://twitter.com/" + posts[j].fromUser + "'>" + posts[j].fromUserName + "</a>" + "</p><br/>" + "<p id='"+JSON.stringify(posts[j])+"' class='tweet' onclick='openTweet(id);'>" + posts[j].text + "</p><br/>" + "<p class='date'>" + posts[j].createdAt + "</p>" + "<br style='clear: both;'/><br/>";

                    var e = document.createElement('span');
                    e.innerHTML = textnode;
                    results.appendChild(e);

                }

                if (count > 10) {

                    pagination(pageindex, count);
                }
            }
        }


    }

    

    function pagination(index, count) {


        var flag = "active";
        var incindex = index + 1;
        var decindex = index - 1;

        if (count % 10 !== 0)
            var limit = Math.floor(count / 10) + 1;
        else
            var limit = Math.floor(count / 10);
        console.log(limit);
        if (index === 1)
            var listnode = "<li class='previous-off'>&lt;&lt;Previous</li>";
        else {
            var listnode = "<li class='next'><a href='javascript:search(" + decindex + ");'>&lt;&lt;Previous</a></li>";


        }
        for (i = pagecount; i < pagecount + 10; i++) {

            if (i > limit) {

                if (limit === index)
                    listnode = listnode + "<li class='previous-off'>Next &gt;&gt;</li>";
                else
                    listnode = listnode + "<li class='next'><a href='javascript:search(" + incindex + ");'>Next &gt;&gt;</a></li>";


                var ul = document.createElement('ul');
                ul.setAttribute("id", "pagination-mongo");
                ul.innerHTML = listnode;
                page.appendChild(ul);
                return;

            }

            if (i === index)
                listnode = listnode + "<li class='" + flag + "'>" + i + "</li>";
            else
                listnode = listnode + "<li><a href='javascript:search(" + i + ");'>" + i + "</a></li>"
        }

        listnode = listnode + "<li class='next'><a href='javascript:search(" + incindex + ");'>Next &gt;&gt;</a></li>";
        var ul = document.createElement('ul');
        ul.setAttribute("id", "pagination-mongo");
        ul.innerHTML = listnode;
        page.appendChild(ul);

    }


    display();

 }
 
 function openTweet(post){
		//alert(post);
		
		
		//var tweets=window.open('web/tweets.html');
		
		
	}

function getXMLHttpRequestObject() {

    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        return (new XMLHttpRequest());
    } else { // code for IE6, IE5
        return (new ActiveXObject("Microsoft.XMLHTTP"));
    }

}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
