<?php

if(!putenv("GNUPGHOME=/tmp/.gnupg/")) {
    echo "Error putting environment";
    die;
}

if(isset($_FILES['key'])) {
    $data = file_get_contents($_FILES['key']['tmp_name']);
    $res = gnupg_init();
    $array = gnupg_import($res, $data);
    if(isset($array['fingerprint'])) {
?>
<html>
    <head><title>Your PGP key</title></head>
        <body>
            <table border=1>
                <tr>
                    <th>Key ID</th>
                    <th>Owner</th>
                    <th>Fingerprint</th>
                </tr>
<?php
        foreach(gnupg_keyinfo($res, $array['fingerprint'])[0]['uids'] as $uid) {
            echo "<tr>";
            echo "<td>" . htmlentities(substr($array['fingerprint'], -16), ENT_QUOTES) . "</td>";
            echo "<td>" . htmlentities($uid['uid'], ENT_QUOTES) . "</td>";
            echo "<td>" . htmlentities($array['fingerprint'], ENT_QUOTES) . "</td>";
            echo "</tr>";
        }
?>
</table>
</body>
</html>
<?php
        die;
    }
    else {
        echo "Failed to upload";
    }
}
?>

<html>
    <body>
        <form action="index.php" method="post" enctype="multipart/form-data">
            Select public key to upload: <br>
            <input type="file" name="key" id="key"><br>
            <input type="submit" value="Upload image" name="submit">
        </form>
    </body>
</html>

