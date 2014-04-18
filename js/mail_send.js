                    // Create a function to log the response from the Mandrill API
        function log(obj) {
            $('#response').text(JSON.stringify(obj));
        }

        // create a new instance of the Mandrill class with your API key
        var m = new mandrill.Mandrill('uuyMmMASRFBrEHKXhTSE1Q');

        // create a variable for the API call parameters
        var merge_vars = [
                    {
                        "rcpt": "srthurman@gmail.com",
                        "vars": [
                            {
                                "name": "ROUTE",
                                "content": ""
                            },
                            {
                                "name": "EDIT_ROUTE",
                                "content": "http://www.google.com"
                            }
                        ]
                    }
                ]
        var params = {
            "message": {
                "from_email":"manila_gtfs_edits@fakeemail.com",
                "to":[{"email":"srthurman@gmail.com"}],
                "subject": "Manila Transit Route Edit",
                "html": "Route *|ROUTE|* has been edited. <a href='*|EDIT_ROUTE|*'>Here's</a> the updated route.",
                "autotext": true,
                "merge_vars": merge_vars
            }
        };

        function sendTheMail() {
        // Send the email!

            m.messages.send(params, function(res) {
                log(res);
            }, function(err) {
                log(err);
            });
        }