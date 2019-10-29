function createEventFromSheet() {
  
  // ----- ここから書き換え -----
  var calendarId = "~@group.calendar.google.com"
  // ----- ここまで書き換え -----
  var sheet, i, myevent, mystart, myend, added, driver, car;
  sheet = SpreadsheetApp.getActiveSheet();
  for(i = 1; i <= sheet.getLastRow(); i++) {
    car = sheet.getRange(i, 4).getValue();
    driver = sheet.getRange(i, 3).getValue();
    myevent = "シェア予約"+"("+car+"/"+driver+")";
    mystart = sheet.getRange(i, 5)
      .getValue();
    myend = sheet.getRange(i, 6)
      .getValue();
    added = sheet.getRange(i, 7).getValue();
    if(added == "") {
      thisevent = CalendarApp.getCalendarById(calendarId).createEvent(myevent, new Date(mystart), new Date(myend));
      sheet.getRange(i, 7).setValue("追加済み");
    }
  }
}