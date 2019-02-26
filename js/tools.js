$(document).ready(function () {
  $('#decodeButton').click(function () {
    decodeAddress()
  })

  $('#walletAddress').keydown(function (e) {
    if (e.which === 13) {
      decodeAddress()
    }
  })

  $('#publicViewKey').keydown(function () {
    encodeAddress()
  })

  $('#publicSpendKey').keydown(function () {
    encodeAddress()
  })

  $('#paymentId').keydown(function () {
    encodeAddress()
  })

  window.cnUtils = new TurtleCoinUtils.CryptoNote()
})

function decodeAddress() {
  var walletAddress = $('#walletAddress').val()

  try {
    var addr = cnUtils.decodeAddress(walletAddress)
    $('#publicViewKey').val(addr.publicViewKey)
    $('#publicSpendKey').val(addr.publicSpendKey)
    $('#paymentId').val(addr.paymentId)
    $('#walletAddress').removeClass('is-danger')
    $('#encodedAddress').val(walletAddress)
  } catch (e) {
    $('#walletAddress').removeClass('is-danger').addClass('is-danger')
  }
}

function encodeAddress() {
  var publicViewKey = $('#publicViewKey').val().trim()
  var publicSpendKey = $('#publicSpendKey').val().trim()
  var paymentId = $('#paymentId').val().trim()

  $('#publicViewKey').removeClass('is-danger')
  $('#publicSpendKey').removeClass('is-danger')
  $('#paymentId').removeClass('is-danger')
  $('#encodedAddress').removeClass('is-danger')

  if (!isHash(publicViewKey)) {
    return $('#publicViewKey').addClass('is-danger')
  }

  if (!isHash(publicSpendKey)) {
    return $('#publicSpendKey').addClass('is-danger')
  }

  if (paymentId.length !== 0 && !isHash(paymentId)) {
    return $('#paymentId').addClass('is-danger')
  }

  try {
    var addr = cnUtils.encodeAddress(publicViewKey, publicSpendKey, paymentId)
    $('#encodedAddress').val(addr)
  } catch (e) {
    $('#encodedAddress').removeClass('is-danger').addClass('is-danger')
  }
}