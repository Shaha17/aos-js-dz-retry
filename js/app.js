'use strict';

const rootEl = document.getElementById('root');

const loadBtn = document.createElement('button');
loadBtn.textContent = 'Загрузить данные';
loadBtn.dataset.action = 'load';
rootEl.appendChild(loadBtn);

const divErrorEl = document.createElement('div');
const errorEl = document.createElement('span');
errorEl.dataset.id = 'error';
divErrorEl.appendChild(errorEl);
const retryBtn = document.createElement('button');
retryBtn.dataset.action = 'retry';
retryBtn.textContent = 'Повторить запрос';
divErrorEl.appendChild(retryBtn);

const wallEl = document.createElement('div');
wallEl.dataset.id = 'wall';
rootEl.appendChild(wallEl);

const loaderEl = document.createElement('div');
loaderEl.dataset.id = 'loader';
loaderEl.textContent = 'Данные загружаются';

const apiUrl = 'http://127.0.0.1:9999/api/hw30/posts';

let posts = [];

function loadData(callbacks) {
    if (typeof callbacks.onStart === 'function') {
        callbacks.onStart();
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl);
    xhr.onload = () => {
        if (xhr.status < 200 || xhr.status > 299) {
            const error = JSON.parse(xhr.responseText);
            if (typeof callbacks.onError === 'function') {
                callbacks.onError(error);
            }
            return;
        }

        const data = JSON.parse(xhr.responseText);
        if (typeof callbacks.onSuccess === 'function') {
            callbacks.onSuccess(data);
        }
    };
    xhr.onerror = () => {
        if (typeof callbacks.onError === 'function') {
            callbacks.onError({ error: 'network error' });
        }
    };
    xhr.onloadend = () => {
        if (typeof callbacks.onFinish === 'function') {
            callbacks.onFinish();
        }
    };
    xhr.send();
}

function makePostEl(post) {
    const postEl = document.createElement('div');
    postEl.dataset.type = post.type;
    postEl.dataset.id = post.id;
    if (post.type === 'text') {
        const contentEl = document.createElement('div');
        contentEl.textContent = post.content;
        postEl.appendChild(contentEl);
    }
    if (post.type === 'image') {
        const contentEl = document.createElement('img');
        contentEl.src = post.content;
        postEl.appendChild(contentEl);
    }
    if (post.type === 'video') {
        const contentEl = document.createElement('video');
        contentEl.src = post.content;
        postEl.appendChild(contentEl);
    }
    return postEl;
}

function deletePosts(wallElement) {
    Array.from(wallElement.children).forEach((o) => wallElement.removeChild(o));
}

function renderPosts(wallElement, postsArr) {
    postsArr.map(makePostEl).forEach((item) => {
        wallElement.appendChild(item);
    });
}

rootEl.addEventListener('click', (evt) => {
    if (evt.target.dataset.action !== 'load') {
        return;
    }

    deletePosts(wallEl, posts);

    loadData({
        onStart: () => {
            rootEl.insertBefore(loaderEl, rootEl.firstElementChild);
        },
        onFinish: () => {
            rootEl.removeChild(loaderEl);
        },
        onSuccess: (data) => {
            posts = data;
            renderPosts(wallEl, posts);
        },
        onError: (error) => {
            rootEl.removeChild(loadBtn);
            rootEl.appendChild(divErrorEl);
            errorEl.textContent = error['message'];
        },
    });
});

rootEl.addEventListener('click', (evt) => {
    if (evt.target.dataset.action !== 'retry') {
        return;
    }

    deletePosts(wallEl, posts);

    loadData({
        onStart: () => {
            rootEl.insertBefore(loaderEl, rootEl.firstElementChild);
        },
        onFinish: () => {
            rootEl.removeChild(loaderEl);
        },
        onSuccess: (data) => {
            posts = data;
            rootEl.removeChild(divErrorEl);
            rootEl.appendChild(loadBtn);
            renderPosts(wallEl, posts);
        },
        onError: (error) => {
            rootEl.removeChild(loadBtn);
            rootEl.appendChild(divErrorEl);
            errorEl.textContent = error['message'];
        },
    });
});
