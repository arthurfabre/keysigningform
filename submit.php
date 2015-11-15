<?php

$key_dir = '/var/keys';

/**
 * Check if a given key is valid.
 * Returns the key's fingerprint if the key is valid, false otherwise.
 */
function get_fp($key) {
    if(!putenv("GNUPGHOME='/tmp/.gnupg/'")) {
        echo "Error setting environment";
        die;
    }
   
    $res = gnupg_init();
    $array = gnupg_import($res, $key);

    if (isset($array['fingerprint'])) {
        return $array['fingerprint'];
    } else {
        return false;
    }
}

if(!isset($_POST['key'])) {
    echo "No key submitted";
    die;
}

$key = $_POST['key'];

$fp = get_fp($key);

if(fp === False) {
    echo "Invalid key";
    die;
}

if (file_put_contents("$fp.pgp", $key) === False) {
    echo "Error saving key";
    die;
}

echo "Key succesfully submitted";
?>
