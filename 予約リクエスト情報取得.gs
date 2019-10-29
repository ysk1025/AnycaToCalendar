function mailToSheet () {

  // ----- ここから書き換え -----
  // 書き込むシートURL
  var sheet_url = 'https://docs.google.com/spreadsheets/d/~/edit';
  // 書き込むシート名
  var sheet_name = 'シート1';
  // Gmailの抽出条件
  var mail_query = 'subject:【Anyca】予約リクエストが届きました';
  // 存在チェック(既にシートに書き込み済のメールは処理しない(日付、件名の一致で判定))
  var existence_check = true;
  // ----- ここまで書き換え -----

  var ss = SpreadsheetApp.openByUrl(sheet_url);
  var sheet = ss.getSheetByName(sheet_name);
  var existence_keys = fetchExistenceKeys();
  var mail_data = fetchMailData();
  for (var i = 0; item = mail_data[i]; i++) {
    // 重複チェック 既存データと合致したらループ抜ける
    if (existence_check && existsData(item)) {
      continue;
    }
    // 重複なければ最終行に値を追加
    sheet.appendRow(itemToRow(item));
  }
  
  function fetchExistenceKeys () {
    var existence_keys = {};
    var sheet_data = sheet.getDataRange().getValues();
    for (var i = 0; row = sheet_data[i]; i++) {
      existence_keys[generateKey(rowToItem(row))] = true;
    }
    return existence_keys;
  }

  function existsData (item) {
    if (existence_keys[generateKey(item)]) {
      return true;
    }
    return false;
  }

  function generateKey (item) {
    var key = item['date'] + '_' + item['subject'];
    // Logger.log(key);
    return key;
  }

  function rowToItem (row) {
    var item = {};
    item['date'] = row[0];
    item['subject'] = row[1];
    item['driver'] = row[2];
    item['car'] = row[3];
    item['start'] = row[4];
    item['end'] = row[5];
    return item;
  }

  function itemToRow (item) {
    var row = [];
    row[0] = item['date'];
    row[1] = item['subject'];
    row[2] = item['driver'];
    row[3] = item['car'];
    row[4] = item['start'];
    row[5] = item['end'];
    return row;
  }

  function fetchMailData () {
    var result = [];
    var threads = GmailApp.search(mail_query);
    for (var i = 0; it = threads[i]; i++) {
      var messages = it.getMessages();
      for (var j = 0; message = messages[j]; j++) {
        var item = {};
        item['date'] = message.getDate();
        item['subject'] = message.getSubject();
        var body = message.getPlainBody();
        // 必要な行から余計な文字列を消去
        var bodys= body.replace('ドライバーニックネーム：','').replace('カーシェア期間：','').replace('に予約リクエストが届きました。','');
        // 改行を使って配列化する
        var ary = bodys.split("\n");
        // ドライバーの行を取得し文字を抽出
        item['driver'] = ary[5].substring(0).replace('\r','').replace('<br>','');
        // 車種の行を取得し文字を抽出
        ary[1] = ary[1].slice(ary[1].indexOf("さんのクルマ、")+7);
        item['car'] = ary[1].substring(0).replace('\r','').replace('<br>','');
        // 予約時間の行を取得し開始時間/終了時間に分けて配列として格納
        var reservation = ary[6].substring(0).replace('\r','').replace('<br>','').split("〜");
        // 日時の書式変換をして格納
        item['start'] = convertDateFormat(reservation[0]);
        item['end'] = convertDateFormat(reservation[1]);
        
        result.push(item);
      }
    }
    return result;
  }  
  function convertDateFormat (date) {
    // 2018年08月11日(土)09:00　→　2018/08/11/09:00に書式変換して返すメソッド
    // "年月日"を"/"に置換
    date = date.replace("年","/").replace("月","/").replace("日","/");
    // 曜日の括弧書き部分だけ除いて結合(前半11文字と後半5文字を合体)
    var convertedDate = date.slice(0,11)+date.slice(-5);
    return convertedDate;
  }
}