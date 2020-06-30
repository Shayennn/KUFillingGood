function findMinMaxTime() {
    var mintime = 8 * 60
    var maxtime = 15 * 60
    Sess['FixedSubjectInfo'].forEach((sub) => {
        str2timearr(sub.coursedate).forEach((timearr) => {
            if (timearr[0] < mintime) mintime = timearr[0]
            if (timearr[1] > maxtime) maxtime = timearr[1]
        })
    })
    return [mintime - 60, maxtime + 60];
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 3; i++) {
        color += letters[8 + Math.floor(Math.random() * 8)];
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function drawTimetable() {
    var timetable = new Timetable();
    const dow = [
        'อาทิตย์',
        'จันทร์',
        'อังคาร',
        'พุธ',
        'พฤหัสบดี',
        'ศุกร์',
        'เสาร์',
    ];
    var minmaxtime = findMinMaxTime()
    timetable.setScope(Math.floor(minmaxtime[0] / 60), Math.ceil(minmaxtime[1] / 60));
    timetable.addLocations(dow);

    Sess['FixedSubjectInfo'].forEach((sub) => {
        var color = getRandomColor()
        str2timearr(sub.coursedate).forEach((timearr) => {
            timetable.addEvent(sub.subjectCode.slice(0, 8) + ':' + sub.sectionCode + ' (' + sub.sectionTypeEn + ')<br>' + sub.subjectNameEn + '', dow[timearr[2]],
                new Date(1999, 7, 29, Math.floor(timearr[0] / 60), timearr[0] % 60), new Date(1999, 7, 29, Math.floor(timearr[1] / 60), timearr[1] % 60), {
                    color: color
                });
        })
    })

    var renderer = new Timetable.Renderer(timetable);
    renderer.draw('.timetable');
}