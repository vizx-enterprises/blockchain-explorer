$(document).ready(function () {
  const id = getQueryStringParam('id')

  if (!isHash(id)) {
    return window.location = '/'
  }

  $.ajax({
    url: ExplorerConfig.apiBaseUrl + '/transactions/' + id,
    dataType: 'json',
    type: 'GET',
    cache: 'false',
    success: function (list) {
      $('#headerPaymentId').text(id).attr("data-badge", list.length)

      const transactions = $('#paymentIdTransactions').DataTable({
        columnDefs: [{
          targets: [0],
          searchable: true
        }, {
          targets: [0],
          render: function (data, type, row, meta) {
            if (type === 'display') {
              data = '<a href="/transaction.html?hash=' + data + '">' + data + '</a>'
            }
            return data
          }
        }],
        searching: true,
        info: false,
        paging: true,
        pageLength: 25,
        lengthMenu: [[25, 50, 100, -1],[25,50,100,"All"]],
        language: {
          emptyTable: "No Transactions For This Payment ID"
        },
        autoWidth: false
      }).columns.adjust().responsive.recalc()

      for (var i = 0; i < list.length; i++) {
        transactions.row.add([
          list[i]
        ])
      }
      transactions.draw(false)
    },
    error: function () {
      window.location = '/'
    }
  })
})