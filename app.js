'use strict';
const Twitter = require('twitter');
const cron = require('cron').CronJob;


// BOTの各種 key や token は、環境変数に保存の上、参照する
 
const client = new Twitter({
    consumer_key: '${Consumer Key}',
    consumer_secret: '${Consumer Secret}',
    access_token_key: '${Access Token}',
    access_token_secret: '${Access Token Secret}'
});


// ツイートする文言集。

// TODO：
// 同じツイートをしようとすると、Twitter API がエラーを返し、同じ発言はできない。
// 同内容のツイートをするには、24 時間あけるか、間に 10 個以上ツイートを挟む必要がある。

const tweets = ['立春',
                '夏',
                '秋',
                '冬',
                'あ',
                'し',
                'す',
                'え',
                'お',
                'か',
                'き',
                'く',
                'せ',
                'そ',
                'こ',
                'さ',
                '温い',
                '極楽'];


// ツイートするため、statuses/update API に POST リクエスト

function randomTweet() {
    const tweetMessage = tweets[Math.floor(Math.random() * tweets.length)];
    client.post('statuses/update', {
            status: tweetMessage
        })
        .then((tweet) => {
            console.log('正常です' + tweet);
        })
        .catch((error) => {
            console.info('エラーです' + error);
            throw error;
        });
}
  

// cron により定期ツイートの設定

const cronJob = new cron({
  cronTime: '00 00 0-23/1 * * *', // 1時間ごとに実行
  start: true, // newしたあと即時に実行するかどうか
  onTick: function(){
    randomTweet();
  }
});

randomTweet();






/** *****************************************************************************
 ** 下記の機能：
 **  - ボットがフォローしているユーザの発言を３分ごとに取得。
 **  - それらユーザの発言に対し、文章に @ユーザー名 を先頭につけ、ツイートした本人にメンションがいく。
 **  - tweet 文章は、相手の内容に追加して、ランダムでリアクションを付け足している。
 ** *****************************************************************************


let checkedTweets = [];

function getHomeTimeLine() {
  client.get('statuses/home_timeline', {}, function (error, tweets, response) {
    if (error) console.log(error);
        // 初回起動時は取得するだけで終了
        if (checkedTweets.length === 0) {
            tweets.forEach(function(homeTimeLineTweet, key) {
                checkedTweets.push(homeTimeLineTweet); // 配列に追加
            });

            return;
        }

        const newTweets = [];
        tweets.forEach(function(homeTimeLineTweet, key) {
            if (isCheckedTweet(homeTimeLineTweet) === false) {
                responseHomeTimeLine(homeTimeLineTweet);
                newTweets.push(homeTimeLineTweet); // 新しいツイートを追加
            }
        });
        
        // 調査済みリストに追加と、千個を超えていたら削除
        checkedTweets = newTweets.concat(checkedTweets); // 配列の連結
        if (checkedTweets.length > 1000) checkedTweets.length = 1000; // 古い要素を消して要素数を1000個にする。
  });
}


function isCheckedTweet(homeTimeLineTweet) {
    // ボット自身のツイートは無視する。
    if (homeTimeLineTweet.user.screen_name === 'BOT04924391') {
        return true;
    }

    for (let checkedTweet of checkedTweets) {
        // 同内容を連続投稿をするアカウントがあるため、一度でも返信した内容は返信しない仕様に。
        if (checkedTweet.id_str === homeTimeLineTweet.id_str || checkedTweet.text === homeTimeLineTweet.text) {
            return true;
        }
    }

    return false;
}


const responses = ['Cool！', 'Sounds Good！', 'Dope！'];

function responseHomeTimeLine(homeTimeLineTweet) {
    const tweetMessage = '@' + homeTimeLineTweet.user.screen_name + '「' + homeTimeLineTweet.text + '」 ' + responses[Math.floor(Math.random() * responses.length)];
    client.post('statuses/update', {
            status: tweetMessage,
            in_reply_to_status_id: homeTimeLineTweet.id_str
        })
        .then((tweet) => {
            console.log(tweet);
        })
        .catch((error) => {
            throw error;
        });
}
  
const cronJob = new cron({
    cronTime: '00 0-59/3 * * * *', // 3分ごとに実行
    start: true, // newしたあと即時に実行するかどうか
    onTick: function(){
      getHomeTimeLine();
    }
  });
  
  getHomeTimeLine();

*/





/** *****************************************************************************
 ** 上記API はリクエスト制限が有るが、stream API の場合は無いので、下記を使うほうが良いかも。
 ** Streaming API では、リアルタイムでツイートを検索して取得できる。
 ** 注意：ボットは同じツイートをしようとすると、Twitter API がエラーを返し、同じ発言はできない。
 ** *****************************************************************************


const stream = client.stream('statuses/filter', { track: '@${自分のボット名}' });
stream.on('data', function(tweet) {
    console.log(tweet.text);

    const tweetMessage = '@' + tweet.user.screen_name + ' Sounds Good!!';
    client.post('statuses/update', {
            status: tweetMessage,
            in_reply_to_status_id: tweet.id_str
        })
        .then((tweet) => {
            console.log(tweet);
        })
        .catch((error) => {
            throw error;
        });
});

stream.on('error', function(error) {
    throw error;
});

*/