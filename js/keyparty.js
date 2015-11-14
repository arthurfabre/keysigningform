'use strict';

/**
 * The public key entered by the user. 
 * null if no valid public key has been entered.
 */
var publicKey;

var publicKeyError = $('#public-key-error');
var publicKeyInfo = $('#public-key-info');

/**
 * Update the public key inputted by the user.
 * This will set publicKey and update the feedback message.
 */
var updatePublicKey = function(key) {
    publicKey = null;

    if (key === "") {
        keyError("No key entered");
        return;
    }

    var newPublicKey = openpgp.key.readArmored(key);
 
    if (newPublicKey.err && newPublicKey.err.length > 0) {
        keyError(newPublicKey.err[0].message);
        return;
    }

    publicKey = newPublicKey.keys[0];

    keyInfo();
}

var keyError = function(msg) {
    publicKeyError.text(msg);
    publicKeyInfo.hide();
    publicKeyError.show();
}

var keyInfo = function() {
    publicKeyInfo.text(publicKey.getPrimaryUser().user.userId.userid);
    publicKeyError.hide();
    publicKeyInfo.show();
}

$('#public-key-input').each(function() {
    var elem = $(this);
    var timer = 0;

    // Look for changes in the value
    elem.bind("propertychange change click keyup input paste", function(event) {

        // Use a timer to ensure we don't run all the time - other we can lock up the browser
        clearTimeout(timer);
        
        timer = setTimeout(function(){
            updatePublicKey(elem.val());
        }, 200);
    });
});

updatePublicKey("");
