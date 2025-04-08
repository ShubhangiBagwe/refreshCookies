"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, {useState} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button, Form, Input } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { login } from "@/lib/actions/auth.action";
import { LoginUserResponse } from "@/types/auth";

interface Props {
  callbackUrl?: string;
}

const validationSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
});

type InputType = z.infer<typeof validationSchema>;

const LoginForm = ({ callbackUrl }: Props) => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const { register } = useForm<InputType>({resolver: zodResolver(validationSchema),});

  const onFinish: SubmitHandler<InputType> = async (data) => {
    try {
      const response: LoginUserResponse = await login(
        data.username,
        data.password,
        1
      );
      if (response.success) {
        router.push( "/home");
      } else {
        setErrorMessage(response.message);
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <Form
      onFinish={onFinish}
      name="loginForm"
      initialValues={{ remember: true }}
      layout="vertical"
      requiredMark={false}
      className="mt-5 w-full flex flex-col font-white formlabel"
      
    >
      <Form.Item
        name="username"
        label="Username"
        // rules={[
        //   {
        //     required: true,
        //     message: "invalid email address",
        //     type: "email",
        //   },
        // ]}
        validateTrigger="onBlur"
        hasFeedback
      >
        <Input
          size="large"
          placeholder="Enter your email"
          {...register("username")}
          onChange={() => setErrorMessage("")}
          className="rounded-md"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[
          {
            required: true,
            message: "password is required",
          },
          {
            min: 8,
            message: "password must be at least 8 characters",
          },
        ]}
        validateTrigger="onBlur"
        hasFeedback
      >
        <Input
          size="large"
          type={passwordVisible ? "text" : "password"}
          placeholder="Enter your password"
          {...register("password")}
          onChange={() => setErrorMessage("")}
          className="rounded-md"
          suffix={
            passwordVisible ? (
              <EyeInvisibleOutlined
                className="text-[#5B5B5B]"
                onClick={() => setPasswordVisible(false)}
              />
            ) : (
              <EyeOutlined
                className="text-[#5B5B5B]"
                onClick={() => setPasswordVisible(true)}
              />
            )
          }
        />
      </Form.Item>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <div className="text-right text-sm font-normal">
        <Form.Item className="text-white tracking-tight">
          <Link href="/forgot-password">Forgot password?</Link>
        </Form.Item>
      </div>

      <Form.Item>
        <Button
          size="large"
          type="primary"
          htmlType="submit"
          className="rounded-md w-full border-none btn-blue text-sm font-semibold text-[#FFF]"
        >
          Sign In
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;


