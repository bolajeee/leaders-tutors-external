import { zodResolver } from "@hookform/resolvers/zod";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { Button, PasswordInput } from "@/components/form";
import useToggle from "@/hooks/useToggle";
import { AuthFormStepsType } from "@/types/auth/auth";
import {
  CreateNewPasswordSchema,
  CreateNewPasswordType,
} from "@/types/auth/schema";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { handleAppError } from "@/lib/axios";
import {
  clearPendingPasswordReset,
  readPendingPasswordReset,
  verifySignupOtp,
} from "@/services/auth";

interface AuthFormStepsProps {
  gotoAuthFormPage: (stepKey: AuthFormStepsType) => void;
}

export const CreatePassword: React.FC<AuthFormStepsProps> = (props) => {
  const { gotoAuthFormPage } = props;
  const [pendingReset] = useState(() => readPendingPasswordReset());
  const passwordResetSuccessToggle = useToggle();
  const [isPending, setIsPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateNewPasswordType>({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: zodResolver(CreateNewPasswordSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!pendingReset?.otp) {
      gotoAuthFormPage("resetPassword");
    }
  }, [pendingReset, gotoAuthFormPage]);

  const login = () => {
    clearPendingPasswordReset();
    gotoAuthFormPage("login");
  };

  const createPassword = async (data: CreateNewPasswordType) => {
    if (!pendingReset?.userId || !pendingReset?.otp) {
      gotoAuthFormPage("resetPassword");
      return;
    }

    try {
      setIsPending(true);

      await verifySignupOtp({
        userId: pendingReset.userId,
        otp: Number(pendingReset.otp),
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      passwordResetSuccessToggle.open();
    } catch (error) {
      handleAppError({ showToast: true, error });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <section className="flex flex-col gap-5 justify-center items-start animate-fade-up">
        <div className="flex flex-col gap-1">
          <div className="w-20">
            <Image
              src="/body-pix/icon.png"
              alt="Vector"
              className="w-full h-auto"
              width={0}
              height={0}
              unoptimized
            />
          </div>
          <h1 className="text-2xl text-[#1F2937] font-bold-custom">
            Create <span className="text-(--secondary-color)">Password</span>
          </h1>
          <p className="text-(--text-color) text-[16px]">
            Enter a strong password to secure your account.
          </p>
        </div>
        <PasswordInput
          id="password"
          label="Create Password"
          message={errors.password?.message}
          disabled={isPending}
          {...register("password")}
        />

        {/* Confirm Password */}
        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          message={errors.confirmPassword?.message}
          disabled={isPending}
          {...register("confirmPassword")}
        />
        {/* BUTTON */}
        <Button
          onClick={handleSubmit(createPassword)}
          text="Proceed"
          frontIcon={<ArrowRight />}
          fullWidth
          isLoading={isPending}
        />
        <p className="text-sm text-(--text-color)">
          Already have an account?{" "}
          <span
            className="text-(--primary-color) font-medium-custom cursor-pointer hover:underline"
            onClick={login}
          >
            Login Here
          </span>
        </p>
      </section>
      <FeedbackDialog
        variant="success"
        title="Password Reset Successful"
        text="Your password have been reset successfully, you can now log into your account with your email and new password."
        btnText="Login to my account"
        loadingText="Processing..."
        onClick={login}
        isOpen={passwordResetSuccessToggle.isOpen}
      />
    </>
  );
};
