'use strict';

/**
 * The public key entered by the user. 
 * null if no valid public key has been entered.
 */
var publicKey;

var publicKeyError = $('#public-key-error');
var publicKeyInfo = $('#public-key-info');


/**
 * Get the size in bits of this key.
 * Returns -1 on error.
 */
openpgp.key.Key.prototype.getSize = function() {
    var publicKeyPacket = this.primaryKey;
    var size = -1;
    if (publicKeyPacket.mpi.length > 0) {
        size = (publicKeyPacket.mpi[0].byteLength() * 8);
    }
    return size;
};

/**
 * Get the primary user id
 */
openpgp.key.Key.prototype.getPrimaryUserId = function() {
    return this.getPrimaryUser().user.userId.userid;
};

/**
 * Get the fingerprint of this key as hex
 */
openpgp.key.Key.prototype.getFingerPrint = function() {
    return this.primaryKey.getFingerprint().toUpperCase().replace(/(.{4})/g,"$1 ");
}

/**
 * Get a string representing the expiration time / date
 */
openpgp.key.Key.prototype.getExpiration = function() {
    if (this.getExpirationTime() === null) {
        return "No expiry";

    } else {
        return this.getExpirationTime().toLocaleString();
    }
}

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

var genSlip = function() {
    var slip = new jsPDF();
    
    slip.fromHTML(tmpl("key_template", publicKey), 15, 15, {
        'width': 200
    });

    slip.save('Slip.pdf');
};

var submitKey = function() {
    $.post("submit.php", {'key': publicKey.armor()})
        .always(function() {
            $('#submission-error').hide(); 
            $('#submission-info').hide(); 
        })
        .done(function(data) {
            $('#submission-info').text(data); 
            $('#submission-info').show(); 
        })
        .fail(function(data) {
            $('#submission-error').text(data === "" ? "Unknown error" : data); 
            $('#submission-error').show(); 
        });
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
