/**
 * 抓取网站 https://8zt.cc/soup/0c6d1.html
 * 如果遇到重复链接则不抓取，限制 20 条
 */
const {
    crawl,
    lifeCycle
} = require("../index");

(async () => {
    let cql = `
        SELECT text($('#sentence')) AS soup
        FROM https://8zt.cc/soup/0c6d1.html
        NEXT URL href($('.foot-1 .btn a'))
        LIMIT 20
    `;
    lifeCycle.beforeEachCrawl = async function (url) {
        console.log(url);
        // return false; // 如果返回 false 则不对该 url 进行抓取
    };
    lifeCycle.afterEachCrawl = function (url, status, select) {
        console.log(url, status, select);
    };
    await crawl(cql);
    process.exit();
})();

// https://8zt.cc/soup/0c6d1.html
// https://8zt.cc/soup/0c6d1.html success { soup: '这个世界没有错，谁让你长得不好看又没钱。' }
// https://8zt.cc/soup/b8c7c.html
// https://8zt.cc/soup/b8c7c.html success { soup: '风水轮流转确实不假，但你在轴心上，这就很尴尬了。' }
// https://8zt.cc/soup/b589d.html
// https://8zt.cc/soup/b589d.html success { soup: '对你好的人是不会随随便便说出来的，随便说出来的人一定是斤斤计较，且要你回报更多的人！' }
// https://8zt.cc/soup/05bae.html
// https://8zt.cc/soup/05bae.html success { soup: '这年头放个假真不容易，连放假都要沾老祖宗的光。' }
// https://8zt.cc/soup/e3bd5.html
// https://8zt.cc/soup/e3bd5.html success { soup: '小明长期被爸妈蒙在鼓里，导致窒息而死。' }
// https://8zt.cc/soup/a952f.html
// https://8zt.cc/soup/a952f.html success { soup: '我连名牌都不认识几个，有时候，别人在炫富我都不知道。' }
// https://8zt.cc/soup/ca050.html
// https://8zt.cc/soup/ca050.html success { soup: '命只有一条，但要命的事，可不止一件。' }
// https://8zt.cc/soup/0ef02.html
// https://8zt.cc/soup/0ef02.html success { soup: '有些人感慨：“自己岁数不小了，还没有成熟起来。”“其实你已经成熟起来了，你成熟起来就这样。”' }
// https://8zt.cc/soup/adf9e.html
// https://8zt.cc/soup/adf9e.html success { soup: '贫贱不能移的意思就是，穷就好好在家呆着，哪儿也别去。' }
// https://8zt.cc/soup/bacaa.html
// https://8zt.cc/soup/bacaa.html success { soup: '没有什么过不去的坎，如果有也只是你自己不想过去罢了！' }
// https://8zt.cc/soup/9176d.html
// https://8zt.cc/soup/9176d.html success { soup: '不笑运气差，一笑脸就大！' }
// https://8zt.cc/soup/03320.html
// https://8zt.cc/soup/03320.html success { soup: '哀莫大于贼心不死。' }
// https://8zt.cc/soup/a8057.html
// https://8zt.cc/soup/a8057.html success { soup: '和老婆相敬如宾只是个开始，然后是相敬如冰，相敬如兵。' }
// https://8zt.cc/soup/31882.html
// https://8zt.cc/soup/31882.html success { soup: '如果人生是一部电影，那你就是，中间弹出来的广告。' }
// https://8zt.cc/soup/25884.html
// https://8zt.cc/soup/25884.html success { soup: '如果你放弃了今天的自己，你就战胜了明天的你。' }
// https://8zt.cc/soup/04060.html
// https://8zt.cc/soup/04060.html success { soup: '你连世界都没观过，哪来的世界观？' }
// https://8zt.cc/soup/105ea.html
// https://8zt.cc/soup/105ea.html success { soup: '你要相信明天，一定会更好的，更好的把你虐成狗。' }
// https://8zt.cc/soup/5607a.html
// https://8zt.cc/soup/5607a.html success { soup: '幸亏你去年没洗头，要不然你今年，炒菜连油都没有。' }
// https://8zt.cc/soup/cf70b.html
// https://8zt.cc/soup/cf70b.html success { soup: '都说姐漂亮，其实都是妆出来的' }
// https://8zt.cc/soup/ddd52.html
// https://8zt.cc/soup/ddd52.html success { soup: '债主，就是那个你破了产，也不会抛弃你的人。' }