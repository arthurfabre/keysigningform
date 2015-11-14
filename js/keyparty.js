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

    var result = openpgp.key.readArmored(key);

    // Check for any errors
    if (result.err && result.err.length > 0) {
        keyError(result.err[0].message);
        return;
    }

    var newPublicKey = result.keys[0];

    // Check the key is not a private key
    if (newPublicKey.isPrivate()) {
        keyError("The key you have supplied is a PRIVATE key!");
        return;
    }
    
    // Check the key is valid
    if (newPublicKey.verifyPrimaryKey() !== openpgp.enums.keyStatus.valid) {
        keyError("Invalid key (expired | revoked | no_self_cert)");
        return;
    }

    publicKey = newPublicKey;

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

/**
 * Get the size in bits of a public key.
 */
var getBitLength = function(key) {
    var publicKeyPacket = key.primaryKey;
    var size = -1;
    if (publicKeyPacket.mpi.length > 0) {
        size = (publicKeyPacket.mpi[0].byteLength() * 8);
    }
    return size;
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
