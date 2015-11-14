'use strict';

/**
 * The public key entered by the user. 
 * null if no valid public key has been entered.
 */
var publicKey;

/**
 * Update the public key inputted by the user.
 * This will set publicKey and update the feedback message.
 */
var updatePublicKey = function(key) {
    if (key === "") {
        $('#public-key-feedback').text("No key entered");
        publicKey = null;
        return;
    }

    var newPublicKey = openpgp.key.readArmored(key);
 
    if (newPublicKey.err && newPublicKey.err.length > 0) {
        $('#public-key-feedback').text(newPublicKey.err[0].message);
        publicKey = null;
        return;
    }

    publicKey = newPublicKey.keys[0];

    $('#public-key-feedback').text(publicKey.getPrimaryUser().user.userId.userid);
}

$('#public-key-input').each(function() {
    var elem = $(this);

    // Save current value of element
    elem.data('oldVal', elem.val());

    // Look for changes in the value
    elem.bind("propertychange change click keyup input paste", function(event) {
        // If value has changed...
        if (elem.data('oldVal') != elem.val()) {
            // Updated stored value
            elem.data('oldVal', elem.val());
            // Do action
            updatePublicKey(elem.val());
        }
    });
});

updatePublicKey("");
