"use client";
import {
  createStudentSchema,
  createTeacherSchema,
  loginFormSchema,
} from "@/lib/validationSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import FormErrorComponent from "./FormErrorComponent";
import FormSuccessComponent from "./FormSuccessComponent.";
import { Eye, EyeOff } from "lucide-react";
import { TeachersDepartment } from "@/lib/data";
import { studentSignup } from "@/actions/signup";

export default function StudentSignupForm() {
  const form = useForm<z.infer<typeof createStudentSchema>>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      rollno: "",
      password: "",
      
      email: "",
      role:"STUDENT",
    },
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (values: z.infer<typeof createStudentSchema>) => {
    setError("");
    setSuccess("");
    setShowPassword(false);
    startTransition(() => {
      studentSignup(values).then((res) => {
        console.log(res);
        if (res?.status === "success") {
          setSuccess(res.message);
        }

        if (res?.status === "error") {
          setError(res.message);
        }
      });
    });

    console.log(values);

  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4  ">
    
        <FormField
          control={form.control}
          name="rollno"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg max-sm:text-base">
                Roll No.
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Roll Number"
                  type="text"
                  className="text-lg max-sm:text-base"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg max-sm:text-base">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Email"
                  type="text"
                  className="text-lg max-sm:text-base"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg max-sm:text-base">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter Password"
                    type={showPassword ? "text" : "password"}
                    className="text-lg max-sm:text-base pr-12"
                    disabled={isPending}
                    {...field}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={isPending}
                    className="absolute right-0 top-0 hover:bg-transparent "
                    onClick={() => {
                      setShowPassword((prev) => !prev);
                    }}
                  >
                    {showPassword ? (
                      <Eye width={24} height={24} />
                    ) : (
                      <EyeOff width={24} height={24} />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
          <Button
            type="submit"
            className="px-8 text-lg max-sm:text-base"
            disabled={isPending}
          >
            {isPending ? "Sigining In..." : "Sign Up"}
          </Button>
        </div>

        <FormErrorComponent errorMessage={error} />
        <FormSuccessComponent successMessage={success} />
      </form>
    </Form>
  );
}
