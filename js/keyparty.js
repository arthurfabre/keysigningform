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

    // Check for any errors
    if (newPublicKey.err && newPublicKey.err.length > 0) {
        keyError(newPublicKey.err[0].message);
        return;
    }

    // Check the key is not a private key
    if (newPublicKey.keys[0].isPrivate()) {
        keyError("The key you have supplied is a PRIVATE key!");
        return;
    }

    publicKey = newPublicKey.keys[0];

    keyInfo();
};

var keyError = function(msg) {
    publicKeyError.text(msg);
    setKeyError(true);
};

var keyInfo = function() {
    publicKeyInfo.html(tmpl("key_template", publicKey));
    //publicKeyInfo.text(publicKey.getPrimaryUser().user.userId.userid);
    setKeyError(false);
};

var setKeyError = function(isError) {
    $('.key-button').attr("disabled", isError);

    publicKeyError.attr("hidden", !isError);
    publicKeyInfo.attr("hidden", isError);
};

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
