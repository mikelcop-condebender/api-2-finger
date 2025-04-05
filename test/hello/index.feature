Feature: Hello World endpoint

    Scenario: Get hello message
        When I GET /
        Then the response should be 200
        And the message should be "Hello, JM!"
