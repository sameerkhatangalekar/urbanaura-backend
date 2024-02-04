import User from '../models/UserModel.js';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { registerUserValidator, loginInformationValidator, forgotPasswordSchemaValidator, resetPasswordValidator, otpValidator } from '../validators/AuthSchemaValidations.js';
import createHttpError from 'http-errors';
import { signAccessToken } from '../helpers/jwtHelper.js'
import crypto from 'crypto';
import Product from '../models/ProductModel.js'
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
        maxAge: 8 * 60 * 60 * 1000,
        secure: true,
        sameSite: 'None'
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
        maxAge: 8 * 60 * 60 * 1000,
        secure: true,
        sameSite: 'None'
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
  generateData: async (req, res, next) => {
    try {


      // const products = await Product.find().lean();

      // const alteredProducts = products.map((product) => (
      //   {
      //     "product": {
      //       "$oid": product._id
      //     },
      //     "quantity": 2,
      //     "size": product.sizes[1],
      //     "color": product.colors[0],
      //     "itemAmount": product.price * 2
      //   }
      // ));

      // const users = faker.helpers.multiple(createRandomUser, {
      //   count: 200
      // })
      const orders = faker.helpers.multiple(createRandomOrder, {
        count: 100
      })
      // const ids = await User.find().select('_id email').lean()

      res.send(orders);
    } catch (error) {
      next(error)
    }
  },
};




function createRandomUser() {

  const user = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    contact: faker.phone.number(),
    password: faker.internet.password(),
    roles: [
      "customer"
    ],
    createdAt: {
      "$date": faker.date.past({ years: 1 })
    },
  }
  return user;
}



function createRandomOrder() {
  const ids = [
    {
      "_id": "65ad4633b3a95423866110d4",
      "email": "sameer@gmail.com"
    },
    {
      "_id": "65ad866d3e6c27913ea45460",
      "email": "sameerkhatangalekar@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2570",
      "email": "Bridie25@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2571",
      "email": "Nathaniel.Swift55@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2572",
      "email": "Javon_Lindgren@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2573",
      "email": "Orion.Batz@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2574",
      "email": "Sallie4@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2575",
      "email": "Bobby_Mosciski30@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2576",
      "email": "Antone.Hoeger73@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2577",
      "email": "Lyric_Bauch@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2578",
      "email": "Dariana.Shields@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2579",
      "email": "Jo.Glover57@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca257a",
      "email": "Jose_Hills11@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca257b",
      "email": "Mohamed40@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca257c",
      "email": "Dejah_Abbott@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca257d",
      "email": "Scottie.Goldner48@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca257e",
      "email": "Everett72@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca257f",
      "email": "Jaunita.Howell34@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2580",
      "email": "Diana.Bauch@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2581",
      "email": "Makenzie.Sipes40@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2582",
      "email": "Liza.Kuhn@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2583",
      "email": "Harry.Fritsch@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2584",
      "email": "Jesus.Kovacek97@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2585",
      "email": "Hector_Langosh30@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2586",
      "email": "Thora6@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2587",
      "email": "Vivien.Cartwright@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2588",
      "email": "Vallie73@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2589",
      "email": "Ally51@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca258a",
      "email": "Doug.Bogisich44@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca258b",
      "email": "Giovani43@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca258c",
      "email": "Fermin.Franecki-Collins25@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca258d",
      "email": "Mary_Gerlach@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca258e",
      "email": "Abraham38@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca258f",
      "email": "Wilfred63@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2590",
      "email": "Destinee_Herman6@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2591",
      "email": "Eula_Nolan15@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2592",
      "email": "Lester.Mann@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2593",
      "email": "Jose_Hyatt@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2594",
      "email": "Assunta.Stanton@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2595",
      "email": "Maximillia55@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2596",
      "email": "Spencer.Marks91@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2597",
      "email": "Linda_Langosh6@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2598",
      "email": "Felix.Grady@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2599",
      "email": "Kaylie.Hackett47@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca259a",
      "email": "Thalia30@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca259b",
      "email": "Jamel.Walter@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca259c",
      "email": "Caterina.Kihn@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca259d",
      "email": "Ron.OConner@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca259e",
      "email": "Muriel_Schmeler20@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca259f",
      "email": "Priscilla_Ritchie@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25a0",
      "email": "Kamren28@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25a1",
      "email": "Gaetano72@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25a2",
      "email": "Kariane_Doyle22@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25a3",
      "email": "Sam.Waelchi@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25a4",
      "email": "Vallie_Cruickshank@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25a5",
      "email": "Marietta.Mante@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25a6",
      "email": "Citlalli54@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25a7",
      "email": "Orin.Jacobi58@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25a8",
      "email": "Vincent82@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25a9",
      "email": "Monique65@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25aa",
      "email": "Ervin_Doyle@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25ab",
      "email": "Elian_Reichel@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25ac",
      "email": "Brannon_Reinger@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25ad",
      "email": "Delores.Robel33@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25ae",
      "email": "Roel_Thiel@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25af",
      "email": "Norwood_Frami@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25b0",
      "email": "Jesse_Medhurst53@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25b1",
      "email": "Jarrett12@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25b2",
      "email": "Frieda17@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25b3",
      "email": "Rahsaan_Franey@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25b4",
      "email": "Carrie.OKon@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25b5",
      "email": "Garry96@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25b6",
      "email": "Kenna.Armstrong@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25b7",
      "email": "Hillard_Turcotte@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25b8",
      "email": "Moises_Franecki87@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25b9",
      "email": "Deborah51@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25ba",
      "email": "Melvin.Treutel@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25bb",
      "email": "Lera_Rogahn21@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25bc",
      "email": "Jada_Klocko67@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25bd",
      "email": "Alysson_Parker-Braun81@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25be",
      "email": "Pink.Breitenberg@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25bf",
      "email": "Baylee.Lubowitz23@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25c0",
      "email": "Aron_Satterfield24@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25c1",
      "email": "Lane_Lindgren@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25c2",
      "email": "Mariah_Metz@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25c3",
      "email": "Jeanne_Will@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25c4",
      "email": "Isaias_Berge@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25c5",
      "email": "Arnulfo91@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25c6",
      "email": "Winifred.Mosciski49@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25c7",
      "email": "Karen_Labadie@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25c8",
      "email": "Norberto_Langworth61@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25c9",
      "email": "Darron42@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25ca",
      "email": "Adonis.Langworth@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25cb",
      "email": "Annie.Fahey@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25cc",
      "email": "Regan.Nicolas@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25cd",
      "email": "Zita.Muller28@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25ce",
      "email": "Golda81@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25cf",
      "email": "Morton12@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25d0",
      "email": "Chandler43@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25d1",
      "email": "Hettie_Sauer26@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25d2",
      "email": "Madonna_Lesch-Rath43@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25d3",
      "email": "Mariela_Flatley61@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25d4",
      "email": "Gus.Walter8@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25d5",
      "email": "Edgardo26@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25d6",
      "email": "Eli15@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25d7",
      "email": "Dovie_Greenfelder@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25d8",
      "email": "Ibrahim23@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25d9",
      "email": "Heather93@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25da",
      "email": "Lenna72@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25db",
      "email": "Ignatius74@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25dc",
      "email": "General27@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25dd",
      "email": "Judd.Osinski10@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25de",
      "email": "Giuseppe0@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25df",
      "email": "Arjun.Crona12@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25e0",
      "email": "Pauline_Kuhn@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25e1",
      "email": "Bill_Morar48@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25e2",
      "email": "Dessie25@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25e3",
      "email": "Kurtis_Wolff@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25e4",
      "email": "Kobe_Harvey64@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25e5",
      "email": "Destiny0@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25e6",
      "email": "Albina1@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25e7",
      "email": "Evangeline.Upton@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25e8",
      "email": "Tevin_Ebert59@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25e9",
      "email": "Brooke28@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25ea",
      "email": "Lily14@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25eb",
      "email": "Dwight.Pfannerstill@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25ec",
      "email": "Prince_Pfeffer@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25ed",
      "email": "Flo65@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25ee",
      "email": "Maxie.Buckridge@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25ef",
      "email": "Pierce62@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25f0",
      "email": "Osbaldo.Predovic@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25f1",
      "email": "Florian_Schowalter77@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25f2",
      "email": "Evelyn_Strosin54@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25f3",
      "email": "Alexa.Smith@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25f4",
      "email": "Nelson74@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25f5",
      "email": "Adalberto.Raynor85@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25f6",
      "email": "Jaquelin.Conroy@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25f7",
      "email": "Yasmin.Yost85@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25f8",
      "email": "Easton_Windler@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25f9",
      "email": "Giovanny99@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25fa",
      "email": "Celestine_Runte@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25fb",
      "email": "Eusebio.Hegmann@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25fc",
      "email": "Kristopher56@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25fd",
      "email": "Elza.Aufderhar@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca25fe",
      "email": "Branson34@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca25ff",
      "email": "Vada_Weimann-Hettinger@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2600",
      "email": "Danyka.Farrell@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2601",
      "email": "Torrance.Goyette@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2602",
      "email": "Garnett29@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2603",
      "email": "Yessenia_Flatley@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2604",
      "email": "Augustus.Haag93@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2605",
      "email": "Kendrick.Volkman@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2606",
      "email": "Alison.Koepp27@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2607",
      "email": "Yolanda77@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2608",
      "email": "Amani_Hills@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2609",
      "email": "Keanu_Walter@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca260a",
      "email": "Jonatan_Roob@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca260b",
      "email": "Dorothea1@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca260c",
      "email": "Elvis_Hettinger@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca260d",
      "email": "Laron.Wuckert@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca260e",
      "email": "Nya43@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca260f",
      "email": "Dante92@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2610",
      "email": "Riley_Witting96@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2611",
      "email": "Harmony_Kerluke81@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2612",
      "email": "Lavonne_Strosin2@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2613",
      "email": "Johnathan_Grady60@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2614",
      "email": "Annamarie.Emmerich82@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2615",
      "email": "Jennyfer_Kuhn24@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2616",
      "email": "Haleigh_Bayer-Bauch14@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2617",
      "email": "Heaven.Harber@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2618",
      "email": "Allison.Prosacco47@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2619",
      "email": "Zelda43@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca261a",
      "email": "Marquis25@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca261b",
      "email": "Aron.Boehm96@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca261c",
      "email": "Joannie_Roob52@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca261d",
      "email": "Thad_Stoltenberg@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca261e",
      "email": "Shaylee54@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca261f",
      "email": "Clara87@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2620",
      "email": "Elliott_Dicki@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2621",
      "email": "Irma90@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2622",
      "email": "Ivah_Deckow@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2623",
      "email": "Karianne59@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2624",
      "email": "Jada_Larkin28@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2625",
      "email": "Carissa61@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2626",
      "email": "Mikel99@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2627",
      "email": "Grover_Rau@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2628",
      "email": "Lou.Kautzer@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2629",
      "email": "Reilly.Johnston66@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca262a",
      "email": "Axel.Altenwerth@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca262b",
      "email": "Rozella_Gleason@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca262c",
      "email": "Johathan_Bauch@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca262d",
      "email": "Aaliyah_Pacocha@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca262e",
      "email": "Reed.Wolf@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca262f",
      "email": "Sylvester_Prosacco@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2630",
      "email": "Estrella.Daniel-Erdman@hotmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2631",
      "email": "Colleen.Hauck93@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2632",
      "email": "Sigrid.Brakus@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2633",
      "email": "Zaria90@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2634",
      "email": "Marian89@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2635",
      "email": "Aaliyah75@yahoo.com"
    },
    {
      "_id": "65bac0feb286839589ca2636",
      "email": "Ewell.Stokes-Marquardt@gmail.com"
    },
    {
      "_id": "65bac0feb286839589ca2637",
      "email": "Franz59@hotmail.com"
    }
  ]
  const prod = [
    {
      "product": {
        "$oid": "65aeb41a632bb14e88fa5cb4"
      },
      "quantity": 2,
      "size": "M",
      "color": "Midnight Black",
      "itemAmount": 2899.98
    },
    {
      "product": {
        "$oid": "65aeb50778aa90e5372e8e93"
      },
      "quantity": 2,
      "size": "M",
      "color": "Purple",
      "itemAmount": 2259.98
    },
    {
      "product": {
        "$oid": "65aeb55d78aa90e5372e8e98"
      },
      "quantity": 2,
      "size": "M",
      "color": "Denim Blue",
      "itemAmount": 2199.98
    },
    {
      "product": {
        "$oid": "65aeb5bb78aa90e5372e8e9c"
      },
      "quantity": 2,
      "size": "M",
      "color": "Beige",
      "itemAmount": 1719.98
    },
    {
      "product": {
        "$oid": "65aeb62678aa90e5372e8ea0"
      },
      "quantity": 2,
      "size": "M",
      "color": "White",
      "itemAmount": 1419.98
    },
    {
      "product": {
        "$oid": "65aeb6d978aa90e5372e8ea6"
      },
      "quantity": 2,
      "size": "M",
      "color": "Denime Blue",
      "itemAmount": 1779.98
    },
    {
      "product": {
        "$oid": "65aeb71378aa90e5372e8eab"
      },
      "quantity": 2,
      "size": "M",
      "color": "Black",
      "itemAmount": 1000
    },
    {
      "product": {
        "$oid": "65aeb74778aa90e5372e8eaf"
      },
      "quantity": 2,
      "size": "M",
      "color": "Navy blue",
      "itemAmount": 1599.98
    },
    {
      "product": {
        "$oid": "65aeb7a078aa90e5372e8eb4"
      },
      "quantity": 2,
      "size": "S",
      "color": "Off white",
      "itemAmount": 1059.98
    },
    {
      "product": {
        "$oid": "65aeb7e378aa90e5372e8eba"
      },
      "quantity": 2,
      "size": "S",
      "color": "Sky blue",
      "itemAmount": 1399.98
    }
  ];
  const status = ['pending', 'shipped', 'delivered'];
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();
  const hour = currentDate.getHours();
  const minute = currentDate.getMinutes();
  const second = currentDate.getSeconds();
  const milliseconds = currentDate.getMilliseconds();
  const uniqueId = v4().substring(0, 8);
  const numericUuid = uniqueId
    .split("-")
    .map((hex) => parseInt(hex, 16))
    .join("");
  const orderId = `${year}${month}${day}-${hour}${minute}${second}-${milliseconds}-${numericUuid}`;
  const userObj = faker.helpers.arrayElement(ids);
  const products = faker.helpers.arrayElements(prod, { max: 3, min: 1 });

  const order = {
    user: {
      userId: {
        "$oid": userObj._id
      },
      email: userObj.email
    },
    orderId: orderId,
    products: products,
    createdAt: {
      "$date": faker.date.past({ years: 1 })
    },
    totalAmount: Math.round(products.reduce((acc, curr) => acc + curr.itemAmount, 0)),
    shipping: {
      city: faker.location.city(),
      country: faker.location.country(),
      line: faker.location.streetAddress(),
      line1: faker.location.streetAddress(),
      postal_code: faker.location.zipCode(),
      state: faker.location.state(),
      status: faker.helpers.arrayElement(status)
    }
  }
  return order;
}