// AEMET XML parser
$Q.aemet = (function () {
  var json = {},
    fn = {
      dayForecastByHours: function ($dia, currentHour, dayIndex) {
        var hours = [],
          realIndex = 0,
          dataElement =  $dia.find('prob_precipitacion'),
          dataElementLength = dataElement.length;

        dataElement.each(function (index, hour) {
          if ((dataElementLength === 7 && index > 2) || (dataElementLength === 3 && index > 0) || dataElementLength === 1) {
            var periodAttrSelector = ($(hour).attr('periodo')) ? '[periodo="' + $(hour).attr('periodo') + '"]' : '',
              period = $(hour).attr('periodo') || '0-24',
              lastHourInPeriod = parseInt(period.split('-')[1], 10);
            if (dayIndex !== 0 || lastHourInPeriod > currentHour) {
              hours.push({
                hour: period,
                rainfallProbability: $dia.find('prob_precipitacion' + periodAttrSelector).text(),
                snowLevel: $dia.find('cota_nieve_prov' + periodAttrSelector).text(),
                skyStatus: {
                  text: $dia.find('estado_cielo' + periodAttrSelector).attr('descripcion'),
                  img: $dia.find('estado_cielo' + periodAttrSelector).text()
                },
                wind: {
                  direction: $dia.find('viento' + periodAttrSelector).find('direccion').text(),
                  speed: $dia.find('viento' + periodAttrSelector).find('velocidad').text()
                },
                // racha_max
                temperature: $dia.find('temperatura').find('dato').eq(realIndex).text() || '-'
                // sens_termica = temp
                // humedad_relativa = temp
              });
            }
            realIndex += 1;
          }
        });
        return hours;
      },
      dayForecastMaxUv: function ($dia) {
        return $dia.find('uv_max').text();
      },
      dayForecastMinAndMax: function ($dia) {
        var $temperatura = $dia.find('temperatura');
        return {
          min: $temperatura.find('minima').text() || null,
          max: $temperatura.find('maxima').text() || null
        };
      },
      dayForecast: function ($dia, currentHour, dayIndex) {
        return {
          temperatureMinMax: fn.dayForecastMinAndMax($dia),
          maxUv: fn.dayForecastMaxUv($dia),
          hours: fn.dayForecastByHours($dia, currentHour, dayIndex)
        };
      },
      days: function (currentDate) {
        var days = [],
          currentIndex = 0;
        fn.$xml.find('dia').each(function (index, dia) {
          var date = $(dia).attr('fecha'),
            slicedDate = date.split('-');
          if (index > 0 || parseInt(slicedDate[2], 10) === currentDate.currentDay) {
            var base = new Date(parseInt(slicedDate[0], 10), (parseInt(slicedDate[1], 10) - 1), parseInt(slicedDate[2], 10));
            days.push({
              date: date,
              formattedDay: Globalize.format(base, "dddd d"),
              formattedDate: Globalize.format(base, $Q.literals.detail.table.dateFormat1),
              forecast: fn.dayForecast($(dia), currentDate.currentHour, currentIndex)
            });
            currentIndex += 1;
          }
        });
        return days;
      },
      about: function () {
        var $origen = fn.$xml.find('origen');
        return {
          author: $origen.find('productor').text(),
          link: $origen.find('enlace').text()
        };
      },
      created: function () {
        var elaborated = fn.$xml.find('elaborado').text().split('T'),
          elaboratedDate = elaborated[0].split('-'),
          elaboratedHour = elaborated[1].split(':'),
          date = new Date(elaboratedDate[0], parseInt(elaboratedDate[1], 10) - 1, elaboratedDate[2], parseInt(elaboratedHour[0], 10), parseInt(elaboratedHour[1], 10), parseInt(elaboratedHour[2], 10));

        return Globalize.format(date, $Q.literals.detail.table.dateFormat2);
      },
      create: function (xml, currentDate) {
        fn.$xml = xml;
        json.days = fn.days(currentDate);
        json.locationName = $(xml).find('nombre').text();
        json.regionName = $(xml).find('provincia').text();
        //json.created = Globalize.format($(xml).find('elaborado').text().replace('T', ' '), "HH:mm (d 'de' MMMM 'de' yyyy)");
        json.created = fn.created();
        json.about = fn.about();
        return json;
      }
    };
  return {
    parse: function (xml, currentDate) {
      return fn.create(xml, currentDate);
    }
  };
}());