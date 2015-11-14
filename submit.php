<?php

if(!putenv("GNUPGHOME=/tmp/.gnupg/")) {
    echo "Error setting environment";
    die;
}

if(isset($_POST['key'])) {

    $key = $_POST['key'];
    $res = gnupg_init();
    $array = gnupg_import($res, $data);
    
    if(isset($array['fingerprint'])) {
        echo "Key succesfully submitted";
        die;
    }

} else {
    echo "Key submission failed";
}
?>
