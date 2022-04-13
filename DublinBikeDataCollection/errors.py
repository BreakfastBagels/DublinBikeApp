class CommunicationError(Exception):
    """Custom error handling class to adapt messages for exceptions when
    dealing with server responses"""

    def __init__(self, code, additional_info):
        """Constructor uses status code and info defined in each subclass"""
        self._response_code = code
        self._message = f"There was an error in the communication with the server. " \
                        f"The server response code was {self._response_code}.\n"
        self._message += additional_info

# String method defined to be used with representation method when displaying info to user
    def __str__(self):
        return self._message

    def __repr__(self):
        return str(type(self))


# Additional info around requests and recommendations sourced online
# Each error handled here is individual subclass of custom Exception class
class Error400(CommunicationError):

    def __init__(self):
        self._code = 400
        self.info = "Bad request error: there is an error in the request itself " \
                    "e.g. syntax errors. Check the request itself and try again."
        super().__init__(self._code, self.info)


class Error401(CommunicationError):

    def __init__(self):
        self._code = 401
        self._info = "Unauthorized error: This really means unauthenticated error. " \
                     "The client must 'authenticate itself' to get response. This usually " \
                     "means that the user needs to login to be authenticated."
        super().__init__(self._code, self._info)


class Error403(CommunicationError):

    def __init__(self):
        self._code = 403
        self._info = "Forbidden error: Caused by not having access rights to the " \
                     "given request. Check that there are no issues with the API key " \
                     "as trying to access something that you don't have the API key for " \
                     "will likely cause this error."
        super().__init__(self._code, self._info)


class Error404(CommunicationError):

    def __init__(self):
        self._code = 404
        self._info = "Not Found error: The server couldn't find what you were looking " \
                     "for. Either the URL wasn't recognised or, for an API, the " \
                     "endpoint is valid but the resource itself doesn't exist."
        super().__init__(self._code, self._info)


class Error408(CommunicationError):

    def __init__(self):
        self._code = 408
        self._info = "Timeout error: The server wants to shut down an unused connection."
        super().__init__(self._code, self._info)


class Error429(CommunicationError):

    def __init__(self):
        self._code = 429
        self._info = "Too Many Requests error: Too many requests have been sent in " \
                     "a given amount of time."
        super().__init__(self._code, self._info)


class Error500(CommunicationError):

    def __init__(self):
        self._code = 500
        self._info = "Internal Server error: The server has encountered a situation that " \
                     "it doesn't know how to handle."
        super().__init__(self._code, self._info)


class Error511(CommunicationError):

    def __init__(self):
        self._code = 511
        self._info = "Network Authentication error: The client needs to authenticate " \
                     "i.e. login, to gain network access."
        super().__init__(self._code, self._info)
