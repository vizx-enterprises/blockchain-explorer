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
})

function decodeAddress() {
  var walletAddress = $('#walletAddress').val()

  try {
    var addr = CryptoNote.decode_address(walletAddress, ExplorerConfig.addressPrefix)
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
    var addr = CryptoNote.encode_address(publicViewKey, publicSpendKey, ExplorerConfig.addressPrefix, paymentId)
    $('#encodedAddress').val(addr)
  } catch (e) {
    $('#encodedAddress').removeClass('is-danger').addClass('is-danger')
  }
}