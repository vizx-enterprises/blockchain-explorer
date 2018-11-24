$(document).ready(function () {
  localData.poolTable = $('#pools').DataTable({
    searching: false,
    info: false,
    paging: false,
    lengthMenu: -1,
    language: {
      emptyTable: "No Mining Pools Found"
    },
    columnDefs: [{
        targets: [0, 1, 2],
        visible: false,
        search: false
      },
      {
        targets: [3],
        render: function (data, type, row, meta) {
          if (type === 'display') {
            data = '<a href="' + data.url + '" target="_blank">' + data.name + '</a>'
          } else if (type === 'sort') {
            data = data.name
          }
          return data
        }
      },
      {
        targets: [5],
        render: function (data, type, row, meta) {
          if (type === 'display') {
            data = numeral(data).format('0,0') + ' H/s'
          }
          return data
        }
      },
      {
        targets: [8],
        render: function (data, type, row, meta) {
          if (type === 'display') {
            data = numeral(data / Math.pow(10, ExplorerConfig.decimalPoints)).format('0,0.00') + ' ' + ExplorerConfig.ticker
          }
          return data
        }
      },
      {
        targets: [9],
        render: function (data, type, row, meta) {
          if (type === 'display') {
            data = (new Date(data)).toGMTString()
          }
          return data
        }
      }
    ],
    order: [
      [0, 'asc']
    ],
    autoWidth: false
  }).columns.adjust().responsive.recalc().draw(false)

  google.charts.setOnLoadCallback(function () {
    $.ajax({
      url: ExplorerConfig.poolListUrl,
      dataType: 'json',
      method: 'GET',
      cache: 'true',
      success: function (data) {
        localData.pools = data.pools
        loadPools(data.pools)
        getCurrentNetworkHashRateLoop()
        updatePoolInfoLoop()
      },
      error: function () {
        alert('Could not retrieve list of pools from + ' + ExplorerConfig.poolListUrl)
      }
    })
  })
})

function updatePoolInfoLoop() {
  setTimeout(function () {
    updatePoolInfo()
    drawPoolPieChart()
    updatePoolInfoLoop()
  }, 15000)
}

function updatePoolInfo() {
  localData.poolTable.rows().every(function (idx, tableLoop, rowLoop) {
    var row = this.data()
    var that = this

    var api = getPoolApiUrl(row[1], row[2])

    $.getJSON(api, function (data) {
      if (row[2].toLowerCase() !== 'node.js') {
        data = parsePoolData(data, row[2])
        row[4] = numeral(data.height).format('0,0')
        row[5] = data.hashrate
        row[6] = numeral(data.miners).format('0,0')
        row[7] = numeral(data.fee).format('0,0.00') + '%'
        row[8] = data.payout
        row[9] = data.lastblock
        that.invalidate()
      } else {
        $.getJSON(row[1] + 'network/stats', function (net) {
          $.getJSON(row[1] + 'config', function (config) {
            data.networkData = net
            data.poolConfig = config
            data = parsePoolData(data, row[2])
            row[4] = numeral(data.height).format('0,0')
            row[5] = data.hashrate
            row[6] = numeral(data.miners).format('0,0')
            row[7] = numeral(data.fee).format('0,0.00') + '%'
            row[8] = data.payout
            row[9] = data.lastblock
            that.invalidate()
          })
        })
      }
    })
  })
  localData.poolTable.draw()
}

function loadPools(pools) {
  $.each(pools, function (index, pool) {
    getAndDrawPoolInfo(pool)
  })
}

function getAndDrawPoolInfo(pool) {
  var api = getPoolApiUrl(pool.api, pool.type)

  $.getJSON(api, function (data) {
    data.name = pool.name,
      data.api = pool.api
    data.type = pool.type
    data.url = pool.url

    if (pool.type.toLowerCase() !== 'node.js') {
      drawPoolData(data, pool.type)
    } else {
      $.getJSON(pool.api + 'network/stats', function (net) {
        $.getJSON(pool.api + 'config', function (config) {
          data.networkData = net
          data.poolConfig = config
          drawPoolData(data, pool.type)
        })
      })
    }
  })
}

function getPoolApiUrl(api, type) {
  switch (type.toLowerCase()) {
    case 'forknote':
      api = api + 'stats'
      break
    case 'node.js':
      api = api + 'pool/stats'
      break
    case 'other':
      break
  }
  return api
}

function drawPoolData(data, type) {
  var poolData = parsePoolData(data, type)

  localData.poolTable.row.add([
    data.name,
    data.api,
    data.type,
    {
      name: data.name,
      url: data.url
    },
    numeral(poolData.height).format('0,0'),
    poolData.hashrate,
    numeral(poolData.miners).format('0,0'),
    numeral(poolData.fee).format('0,0.00') + '%',
    poolData.payout,
    poolData.lastblock
  ]).draw(false)
  drawPoolPieChart()
}

function parsePoolData(data, type) {
  var result = {
    height: 0,
    hashrate: 0,
    miners: 0,
    fee: 0,
    payout: 0,
    lastblock: 0
  }

  switch (type.toLowerCase()) {
    case 'forknote':
      result = {
        height: data.network.height,
        hashrate: parseInt(data.pool.hashrate),
        miners: data.pool.miners,
        fee: data.config.fee,
        payout: data.config.minPaymentThreshold,
        lastblock: parseInt(data.pool.lastBlockFound)
      }
      if (data.config.donation) {
        $.each(Object.keys(data.config.donation), function (idx, elem) {
          result.fee = parseFloat(data.config.donation[elem]) + result.fee
        })
      }
      break;
    case 'node.js':
      result = {
        height: data.networkData.height,
        hashrate: parseInt(data.pool_statistics.hashRate),
        miners: data.pool_statistics.miners,
        fee: data.poolConfig.pplns_fee,
        payout: data.poolConfig.min_wallet_payout,
        lastblock: (parseInt(data.pool_statistics.lastBlockFoundTime) * 1000)
      }
      break
    case 'other':
      result = {
        height: data.height,
        hashrate: parseInt(data.hashRate),
        miners: data.miners,
        fee: data.fee,
        payout: (data.minimum * Math.pow(10, ExplorerConfig.decimalPoints)),
        lastblock: (parseInt(data.lastBlockFoundTime) * 1000)
      }
      break
  }

  return result
}

function drawPoolPieChart() {
  var data = [
    ['Pool', 'Hashrate']
  ]
  var slices = {}

  var count = 0
  var currentHashRate = localData.networkHashRate
  localData.poolTable.rows().every(function (idx, tableLoop, rowLoop) {
    var row = this.data()
    data.push([row[3].name, row[5]])
    currentHashRate = currentHashRate - row[5]
    slices[count] = {
      offset: 0
    }
    count++
  })
  if (currentHashRate > 0) {
    data.push(['Unknown', currentHashRate])
    slices[count] = {
      offset: 0
    }
    count++
  }

  var options = {
    is3D: false,
    colors: ['#212721', '#fac5c3', '#6d9eeb', '#40c18e', '#8e7cc3', '#00853d', '#f6b26b', '#45818e', '#de5f5f'],
    chartArea: {
      width: '100%'
    },
    pieHole: 0.45,
    legend: 'none',
    pieSliceText: 'label',
    height: 800,
    slices: slices
  }

  try {
    var chart = new google.visualization.PieChart(document.getElementById('poolPieChart'))
    chart.draw(google.visualization.arrayToDataTable(data), options)
  } catch (e) {}
}