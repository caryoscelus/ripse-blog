/*
 *  Copyright (C) 2014 caryoscelus
 *  
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *  
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *  
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function loadURL (url, mime, callback) {
    var xobj = new XMLHttpRequest()
    xobj.overrideMimeType(mime)
    xobj.open('GET', url, true)
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == '200') {
            callback(xobj.response)
        }
    }
    xobj.send(null)
}

function clearNode (node) {
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild)
    }
}

function disableNoJSWarning () {
    while (true) {
        var nojs_divs = document.getElementsByClassName('nojs')
        if (nojs_divs.length > 0) {
            nojs_divs[0].remove()
        } else {
            break
        }
    }
}

// TODO: get rid of this?
var post_template = ''

function loadTemplate () {
    loadURL('post.html', 'text/html; charset=UTF-8', function(response) {
        post_template = response
    })
}

function reloadData (response) {
    var data = JSON.parse(response)
    
    // title
    document.title = data.title
    
    // header
    var header_div = document.getElementById('header')
    header_div.innerHTML = '<h1>'+data.header+'</h1>'
    
    // top menu
    var top_menu_div = document.getElementById('top_menu')
    top_menu_div.innerHTML = '<a href="javascript:reload()">[reload]</a>'
    
    var content_div = document.getElementById('content')
    clearNode(content_div)
    
    // load posts
    var posts = data.posts
    var post_divs = []
    for (var i = posts.length-1; i >= 0; --i) {
        var post = posts[i]
        var post_div = document.createElement('div')
        post_div.setAttribute('class', 'post')
        post_div.innerHTML = "[loading post..]"
        content_div.appendChild(post_div)
        
        var load_post = function(post, post_div) {
            return function(response) {
                // make proper escaping here!!!
                var post_text = response
                
                var post_html = post_template
                post_html = post_html.replace("%TITLE%", post.title)
                post_html = post_html.replace("%CONTENT%", post_text)
                post_html = post_html.replace("%AUTHOR%", post.author)
                post_html = post_html.replace("%DATE%", post.date)
                post_html = post_html.replace("%TIME%", post.time)
                post_div.innerHTML = post_html
                
                post_divs.push(post_div)
            }
        }
        loadURL('posts/'+post.file+'.html', 'text/html; charset=UTF-8', load_post(post, post_div))
    }
}

function reload () {
    loadURL('content.json', 'application/json', reloadData)
}

disableNoJSWarning()

loadTemplate()

reload()
