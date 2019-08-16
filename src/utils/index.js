import store from '../store';

const setVer = (name, ver) => {
  store.commit(name, new Date(ver).toLocaleString());
};

const debounce = function (action, idle) {
  let last;
  return function () {
    const ctx = this,
      args = arguments;
    clearTimeout(last);
    last = setTimeout(function () {
      action.apply(ctx, args);
    }, idle);
  };
};



const throttle = function (action, delay) {
  var last = 0;
  return function () {
    var curr = +new Date();
    if (curr - last > delay) {
      // console.log('hit  ' + (curr - last));
      action.apply(this, arguments);
      last = curr;
    }
  };
};

const path = 'https://andata.somedata.top/dataX/';

// import 'core-js/modules/es.object.from-entries';

const fetchPut = (url, data) => {
  return fetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(res => res.json())
    .catch(err => Promise.reject(err));

};



const submitFeedback = content => {
  return fetchPut('/api/arknights/feedback', content)
    .catch(err => console.error(err))
    .then(res => Promise.resolve(res));
};

//包装fetch，使用get
const fetchGet = (url) => {
  return fetch(url, {
    method: 'GET'
  }).then(res => {
    if (res.ok) {
      return res.json();
    }
    else {
      return Promise.reject('server error');
    }
  });
};



const getProfileList = () => {
  return fetchGet('/api/arknights/data/shortList')
    .then(res => fetchGet('https' + res.url.slice(4)))
    .catch(err => {
      console.log(err);
      return [];
    });
};

const getEnemyList = () => {
  return fetchGet('/api/arknights/data/enemyList')
    .then(res => {
      setVer('setEnemyVer', res.lastModified);
      return fetchGet('https' + res.url.slice(4));
    }
    )
    .catch(err => {
      console.log(err);
      return [];
    });
};


const getEneAppearMap = () => {
  return fetchGet('/api/arknights/data/enemyAppearMap')
    .then(res => {
      setVer('setApperMapVer', res.lastModified);
      return fetchGet('https' + res.url.slice(4));
    })
    .catch(err => {
      console.log(err);
      return [];
    });
};

const getDevList = () => {
  return fetchGet('/api/arknights/data/devList')
    .then(res => {
      setVer('setListVer', res.lastModified);
      return fetchGet('https' + res.url.slice(4));
    })
    .catch(err => {
      console.log('error');
      console.log(err);
      return [];
    });
};


const getHeroData = name => {
  return fetchGet(path + 'char/data/' + name + '.json')
    .catch(err => console.error(err));
};

const getEnemyData = key => {
  return fetchGet(path + 'enemy/data/details/' + key + '.json')
    .catch(err => console.error(err));
};

const getMapData = name => {
  return fetchGet(path + 'map/data/' + name + '.json')
    .catch(err => console.error(err));
};

const getMapDataLsitVer = name => {
  console.log(name);
  return fetchGet(path + 'map/exData/' + name + '.json')
    .catch(err => console.error(err));
};




function sort(array, less) {

  function swap(i, j) {
    const t = array[i];
    array[i] = array[j];
    array[j] = t;
  }

  function quicksort(left, right) {

    if (left < right) {
      const pivot = array[left + Math.floor((right - left) / 2)];
      let
        left_new = left,
        right_new = right;

      do {
        while (less(array[left_new], pivot)) {
          left_new += 1;
        }
        while (less(pivot, array[right_new])) {
          right_new -= 1;
        }
        if (left_new <= right_new) {
          swap(left_new, right_new);
          left_new += 1;
          right_new -= 1;
        }
      } while (left_new <= right_new);

      quicksort(left, right_new);
      quicksort(left_new, right);

    }
  }

  quicksort(0, array.length - 1);

  return array;
}


const sortByTime = data => {
  const format = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  });
  data.forEach(element => {
    const date = element.time ? new Date(element.time) : '';
    if (date) element.time = format.format(date);
    element.editing = false;
  });
  try {
    return sort(data, (a, b) => {
      return a.time > b.time;
    });
  } catch (error) {
    console.log(error);
  }
};

const class_chinese = {
  MEDIC: { isTag: false, text: '医疗', value: 'MEDIC', short: '医' },
  CASTER: { isTag: false, text: '术士', value: 'CASTER', short: '术' },
  SNIPER: { isTag: false, text: '狙击', value: 'SNIPER', short: '狙' },
  WARRIOR: { isTag: false, text: '近卫', value: 'WARRIOR', short: '战' },
  PIONEER: { isTag: false, text: '先锋', value: 'PIONEER', short: '先' },
  TANK: { isTag: false, text: '重装', value: 'TANK', short: '重' },
  SPECIAL: { isTag: false, text: '特种', value: 'SPECIAL', short: '特' },
  SUPPORT: { isTag: false, text: '辅助', value: 'SUPPORT', short: '辅' },

};

const getClass_Chinese = en => {
  return class_chinese[en].text;
};

const getClass_Short = en => {
  return class_chinese[en].short;
};





const changeDesc = (desc) => {
  const reg1 = /(<\/>)/g,
    reg2 = /\\n/g,
    ccVup = /(<@cc\.vup>)/g,
    ccVdown = /(<@cc\.(vdown|talpu|pn)>)/g,
    // ccPn = /(<@cc.pn>)/g,
    // ccTalpu = /(<@cc.talpu>)/g,
    baPn = /(<@ba\.pn>)/g,
    baVdown = /(<@ba\.vdown>)/g,
    ccRem = /(<@cc\.rem>)/g,
    ccKw = /(<@cc\.kw>)/g,
    baVup = /(<@ba\.vup>)/g,
    baRem = /(<@ba\.rem>)/g,
    baKw = /(<@ba\.kw>)/g,
    baTalpu = /(<@ba\.talpu>)/g,
    lvItem = /<@lv\.(item|rem|fs)>/g;

  if (!reg1.test(desc) && !reg2.test(desc)) return desc;
  desc = desc
    .replace(reg1, '</i>')
    .replace(reg2, '<br/>')
    .replace(ccVup, '<i style="color:#0098DC;font-style: normal;">')
    .replace(ccVdown, '<i style="color:#FF6237;font-style: normal;">')
    // .replace(ccTalpu, '<i style="color:#FF6237;font-style: normal;">')
    // .replace(ccPn, '<i style="color:#FF6237;">')
    .replace(baPn, '<i style="color:#FF6237;">')
    .replace(baVdown, '<i style="color:#FF6237;font-style: normal;">')
    .replace(ccRem, '<i style="color:#F49800;font-style: normal;">')
    .replace(ccKw, '<i style="color:#00B0FF;font-style: normal;">')
    .replace(baVup, '<i style="color:#F49800;font-style: normal;">')
    .replace(baRem, '<i style="color:#F49800;font-style: normal;">')
    .replace(baKw, '<i style="color:#00B0FF;font-style: normal;">')
    .replace(baTalpu, '<i style="color:#F49800;font-style: normal;">')
    .replace(lvItem, '<i style="color:#049cb8;font-style: normal;">');

  return desc;
};


const getClass_icon = (c) => {
  return path + 'others/icon_profession_' + c.toLowerCase() + '.png';
};

import UaParser from 'ua-parser-js';

const Browser = () => new UaParser().getBrowser();
const isMoblie = () => new UaParser().getDevice().type === 'mobile';

const getWebpOk = () => {
  const ua = new UaParser();
  const OS = ua.getOS();
  const Browser = ua.getBrowser();
  const isMoblie = ua.getDevice().type === 'mobile';
  console.log(OS);
  console.log(Browser);
  if (
    OS.name === 'iOS' ||
    (OS.name === 'Mac OS' && Browser.name === 'Safari') ||
    (Browser.name === 'Edge' && Browser.version < '18')
  ) {
    return { ok: false, mobile: isMoblie };
  } else {
    return { ok: true, mobile: isMoblie };
  }
};

const webpOk = getWebpOk().ok;

const getProfilePath = name => {
  return webpOk ? `${path}char/profile/${name}_optimized.png?x-oss-process=style/small-test`
    : `${path}char/profile/${name}.png`;
};

const getDetailsProfilePath = name => {
  return webpOk ? `${path}char/profile/${name}_optimized.png?x-oss-process=style/profile-test`
    : `${path}char/profile/${name}.png`;
};

const changeKey = key => {
  const test = /_/.exec(key);
  if (test) {
    const temp = key.split('');
    temp.splice(test.index, 1);
    temp[test.index] = temp[test.index].toUpperCase();
    return temp.join('');
  } else {
    return key;
  }
};


export {
  debounce,
  throttle,
  getHeroData,
  sort,
  sortByTime,
  getProfileList,
  getClass_Chinese,
  path,
  getClass_Short,
  class_chinese,
  fetchGet,
  changeDesc,
  getProfilePath,
  getDetailsProfilePath,
  getClass_icon,
  webpOk,
  Browser,
  getEnemyList,
  getEnemyData,
  getEneAppearMap,
  getDevList,
  isMoblie,
  getMapData,
  getMapDataLsitVer,
  changeKey,
  submitFeedback
};


