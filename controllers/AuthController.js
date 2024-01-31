import User from '../models/UserModel.js';
import { registerUserValidator, loginInformationValidator, forgotPasswordSchemaValidator, resetPasswordValidator, otpValidator } from '../validators/AuthSchemaValidations.js';
import createHttpError from 'http-errors';
import { signAccessToken, verifyAccessToken } from '../helpers/jwtHelper.js'
import crypto from 'crypto';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export default {
  register: async (req, res, next) => {
    try {
      const validated = await registerUserValidator.validateAsync(req.body);
      const doesExists = await User.findOne({ email: validated.email });
      if (doesExists) throw createHttpError.Conflict(`${validated.email} is already been registered`);
      const user = new User(validated);
      await user.save();
      res.status(201).send({
        status: 201,
        message: "Registered Successfully"
      })
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const validated = await loginInformationValidator.validateAsync(req.body);
      const user = await User.findOne({ email: validated.email });
      if (!user) throw createHttpError.NotFound("User does not exists");

      const isValidPassword = await user.isValidPassword(validated.password);
      if (!isValidPassword) throw createHttpError.BadRequest("Email / Password not valid");

      const accessToken = await signAccessToken(user.id);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 8 * 60 * 60 * 1000
      })
      res.send({
        accessToken
      })

    } catch (error) {
      next(error)
    }
  },
  adminLogin: async (req, res, next) => {
    try {
      const validated = await loginInformationValidator.validateAsync(req.body);
      const user = await User.findOne({ email: validated.email });
      if (!user) throw createHttpError.NotFound("User does not exists");
      if (!user.roles.includes("admin")) throw createHttpError.Forbidden("Forbidden");
      const isValidPassword = await user.isValidPassword(validated.password);
      if (!isValidPassword) throw createHttpError.BadRequest("Email / Password not valid");


      const accessToken = await signAccessToken(user.id);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 8 * 60 * 60 * 1000
      })
      res.send({
        accessToken
      })

    } catch (error) {
      next(error)
    }
  },
  logout: async (req, res, next) => {
    try {

      res.clearCookie('accessToken')
      res.status(202).send({
        status: 202,
        message: 'Logged out successfully'
      })

    } catch (error) {
      next(error)
    }
  },
  forgotPassword: async (req, res, next) => {
    try {

      const { email } = await forgotPasswordSchemaValidator.validateAsync(req.body);

      const user = await User.findOne({ email: email });

      if (!user) throw createError.NotFound(`${email} not registered`);

      const otp = crypto.randomInt(1000, 9999).toString();
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
      const resetPasswordExpire = Date.now() + 15 * 60 * 1000;
      await User.findOneAndUpdate(
        { email },
        {
          $set: {
            verifyToken: resetPasswordToken,
            verifyTokenExpire: resetPasswordExpire,
          },
        }
      );



      console.log(otp);

      const { data, error } = await resend.emails.send({
        from: "no-reply@sameerkhatangalekar.co.in",
        to: [user.email],
        subject: "Password Reset",
        html: `
                  <!DOCTYPE html>
                  <html xmlns="http://www.w3.org/1999/xhtml">
                  
                  <head>
                    <title></title>
                    <!--[if !mso]><!-- -->
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <!--<![endif]-->
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style type="text/css">
                      #outlook a {
                        padding: 0;
                      }
                  
                      .ReadMsgBody {
                        width: 100%;
                      }
                  
                      .ExternalClass {
                        width: 100%;
                      }
                  
                      .ExternalClass * {
                        line-height: 100%;
                      }
                  
                      body {
                        margin: 0;
                        padding: 0;
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                      }
                  
                      table,
                      td {
                        border-collapse: collapse;
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                      }
                  
                    </style>
                    <!--[if !mso]><!-->
                    <style type="text/css">
                      @media only screen and (max-width:480px) {
                        @-ms-viewport {
                          width: 320px;
                        }
                        @viewport {
                          width: 320px;
                        }
                      }
                    </style>
                    <!--<![endif]-->
                    <!--[if mso]><xml>  <o:OfficeDocumentSettings>    <o:AllowPNG/>    <o:PixelsPerInch>96</o:PixelsPerInch>  </o:OfficeDocumentSettings></xml><![endif]-->
                    <!--[if lte mso 11]><style type="text/css">  .outlook-group-fix {    width:100% !important;  }</style><![endif]-->
                    <!--[if !mso]><!-->
                    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
                    <style type="text/css">
                      @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
                    </style>
                    <!--<![endif]-->
                    <style type="text/css">
                      @media only screen and (max-width:595px) {
                        .container {
                          width: 100% !important;
                        }
                        .button {
                          display: block !important;
                          width: auto !important;
                        }
                      }
                    </style>
                  </head>
                  
                  <body style="font-family: 'Inter', sans-serif; background: #E5E5E5;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
                      <tbody>
                        <tr>
                          <td valign="top" align="center">
                            <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
                              <tbody>
                                <tr>
                                  <td style="padding:48px 0 30px 0; text-align: center; font-size: 20px; color: #000000;">
                                        <h1>UrbanAura</h1>
                                  </td>
                                </tr>
                                <tr>
                                  <td class="main-content" style="padding: 48px 30px 40px; color: #000000;" bgcolor="#ffffff">
                                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                                      <tbody>
                                        <tr>
                                          <td style="padding: 0 0 24px 0; font-size: 18px; line-height: 150%; font-weight: bold; color: #000000; letter-spacing: 0.01em;">
                                            Hello! ${user.name} Forgot your password?
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                                            We received a password reset request for your account: <span style="color: #4C83EE;">${user.email}</span>.
                                          </td>
                                        </tr>
                                        
                                        
                                        <tr>
                                          <td style="padding: 0 0 10px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                                            The password reset OTP is <strong>${otp}</strong> is only valid for the next 15 minutes.
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding: 0 0 60px 0; font-size: 14px; line-height: 150%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                                            If you didn’t request the password reset, please ignore this message.
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding: 0 0 16px;">
                                            <span style="display: block; width: 117px; border-bottom: 1px solid #8B949F;"></span>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="font-size: 14px; line-height: 170%; font-weight: 400; color: #000000; letter-spacing: 0.01em;">
                                            Best regards, <br><strong>UrbanAura</strong>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 24px 0 48px; font-size: 0px;">
                                    <!--[if mso | IE]>      <table role="presentation" border="0" cellpadding="0" cellspacing="0">        <tr>          <td style="vertical-align:top;width:300px;">      <![endif]-->
                                    <div class="outlook-group-fix" style="padding: 0 0 20px 0; vertical-align: top; display: inline-block; text-align: center; width:100%;">
                                      <span style="padding: 0; font-size: 11px; line-height: 15px; font-weight: normal; color: #8B949F;"><strong>UrbunAura</strong><br/>
                                      </div>
                                    </div>
                                    <!--[if mso | IE]>      </td></tr></table>      <![endif]-->
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </body>
                  </html>
            `,
      });

      if (error) {
        console.log(error)
        await User.findOneAndUpdate(
          { email },
          {
            $set: {
              verifyToken: undefined,
              verifyTokenExpire: undefined,
            },
          }
        );
        throw createHttpError.InternalServerError('Failed to send email');
      }

      res.status(202).json({
        status: 202,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      if (error.isJoi == true) error.status = 422;
      next(error);
    }
  },
  verifyOTP: async (req, res, next) => {
    try {
      const validated = await otpValidator
        .validateAsync(req.body);

      const token = crypto
        .createHash("sha256")
        .update(validated.otp.toString())
        .digest("hex");
      const user = await User.findOne({
        verifyToken: token,
        verifyTokenExpire: { $gt: Date.now() },
      });

      if (!user)
        throw createHttpError.BadRequest(
          "Reset password OTP is invalid or has been expired"
        );

      res.status(202).send({
        status: 202,
        message: "OTP verified",
      });
    } catch (error) {
      console.log(error)
      if (error.isJoi == true) error.status = 422;
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const validated = await resetPasswordValidator
        .validateAsync(req.body);

      const token = crypto
        .createHash("sha256")
        .update(validated.otp.toString())
        .digest("hex");
      const user = await User.findOne({
        email: validated.email,
      });

      if (!user)
        throw createError.NotFound(`${validated.email} is not registered`);

      if (user.verifyToken === token && user.verifyTokenExpire > Date.now()) {
        user.password = validated.password;
        user.verifyToken = undefined;
        user.verifyTokenExpire = undefined;
        await user.save();
        res.status(202).send({
          status: 202,
          message: "Password changed",
        });
      } else {
        throw createHttpError.BadRequest(
          "Reset password OTP is invalid or has been expired"
        );
      }
    } catch (error) {
      if (error.isJoi == true) error.status = 422;
      next(error);
    }
  },

};
